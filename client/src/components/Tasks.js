import React, { useState, useEffect } from 'react';
import { Card, Button, ListGroup, Dropdown, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [taskStatuses, setTaskStatuses] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const userData = storedUser ? JSON.parse(storedUser) : null;

    if (!userData) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }

    setUser(userData);
    fetchTasks();
  }, [navigate]);

  const fetchTasks = async () => {
    try {
      console.log('Fetching tasks...');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tasks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const result = await response.json();
      console.log('Tasks fetched:', result);

      setTasks(result);

      const statusMap = {};
      result.forEach(task => {
        statusMap[task._id] = task.status;
      });
      setTaskStatuses(statusMap);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      console.log('Deleting task with id:', taskId);
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setTasks(tasks.filter(task => task._id !== taskId));
      console.log('Task deleted successfully.');
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        console.error('Failed to update status');
        return;
      }

      // Update local state immediately
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );

    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleVolunteerComplete = async (taskId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: "completed" }),
      });

      if (!response.ok) {
        console.error('Failed to update status');
        return;
      }

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId ? { ...task, status: "pending_confirmation" } : task
        )
      );

    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="tasks-container container mt-4">
      <h3 className="mb-4 text-center">Your Tasks</h3>
      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <div className="task-list-container">
          <Card className="shadow-lg rounded-lg">
            <Card.Body>
              {tasks.length > 0 ? (
                <ListGroup variant="flush">
                  {tasks.map((task) => (
                    <div key={task._id} className="task-item mb-3">
                      <ListGroup.Item className="p-4 rounded-lg task-card">
                        <div className="d-flex justify-content-between align-items-center">
                          <h5 className="text-truncate task-title" style={{ maxWidth: '70%' }}>
                            {task.title}
                          </h5>
                          <Button variant="info" size="sm" className="view-task-btn">
                            View Task
                          </Button>
                        </div>
                        <p>{task.description}</p>
                        <small className="text-muted">
                          Due Date: {new Date(task.dueDate).toLocaleDateString()}
                        </small>

                        {user?.role === "volunteer" && (
                          <>
                            {task.status === "pending_confirmation" ? (
                              <Button variant="secondary" size="sm" disabled>
                                Pending Confirmation
                              </Button>
                            ) : task.status === "completed" ? (
                              <Button variant="success" size="sm" disabled>
                                Completed
                              </Button>
                            ) : (
                              <Dropdown>
                                <Dropdown.Toggle variant="warning" size="sm" id={`dropdown-${task._id}`}>
                                  {task.status}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item onClick={() => updateTaskStatus(task._id, "pending")}>
                                    Pending
                                  </Dropdown.Item>
                                  <Dropdown.Item onClick={() => updateTaskStatus(task._id, "in-progress")}>
                                    In Progress
                                  </Dropdown.Item>
                                  <Dropdown.Item onClick={() => handleVolunteerComplete(task._id)}>
                                    Completed
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            )}
                          </>
                        )}

                        {["admin", "staff"].includes(user?.role) && (
                          <div className="mt-3">
                            <Button variant="outline-primary" size="sm" className="me-2">
                              Edit Task
                            </Button>
                            {user.role === "admin" && (
                              <Button variant="outline-danger" size="sm" onClick={() => handleDelete(task._id)}>
                                Delete Task
                              </Button>
                            )}
                          </div>
                        )}

                        {user?.role === "admin" && task.status === "pending_confirmation" && (
                          <Button
                            variant="success"
                            size="sm"
                            className="mt-2"
                            onClick={() => updateTaskStatus(task._id, "completed")}
                          >
                            Confirm Completion
                          </Button>
                        )}
                      </ListGroup.Item>
                    </div>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-center">No tasks available.</p>
              )}
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Tasks;