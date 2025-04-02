import React, { useState, useEffect } from 'react';
import { Card, Button, ListGroup, Dropdown, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/Tasks.css';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [message, setMessage] = useState('');

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
            console.log(`Updating task ${taskId} status to ${newStatus}`);
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tasks/${taskId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                let errorMessage = `Failed to update status: ${response.status}`; // Start with the status code
                try {
                    const errorData = await response.json(); // Try to get JSON error
                    if (errorData && errorData.message) {
                        errorMessage += ` - ${errorData.message}`; // Add the message if available
                    }
                } catch (jsonError) {
                    // If JSON parsing fails, just use the status code.  We might also
                    // try to get the text of the response, but that could lead to
                    // the "body stream already read" error if we're not careful.
                    console.error("Error parsing JSON error response", jsonError);
                }
                setMessage(errorMessage);
                console.error('Failed to update status', errorMessage);
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
            setMessage('Error updating task status'); // set message.
        }
    };

    const handleVolunteerComplete = async (taskId) => {
      try {
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tasks/${taskId}/status`, {  // Changed route
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify({ status: "completed" }), // Changed status
          });
  
          if (!response.ok) {
              let errorMessage = `Failed to update status: ${response.status}`;
              try {
                  const errorData = await response.json();
                  if (errorData && errorData.message) {
                      errorMessage += ` - ${errorData.message}`;
                  }
              } catch (e) {
                  console.error("error parsing json", e);
              }
              setMessage(errorMessage);
              console.error('Failed to update status', errorMessage);
              return;
          }
  
          setTasks(prevTasks =>
              prevTasks.map(task =>
                  task._id === taskId ? { ...task, status: "pending_confirmation" } : task
              )
          );
  
      } catch (error) {
          console.error('Error updating status:', error);
          setMessage('Error updating task status');
      }
  };
  

    const handleAdminConfirmCompletion = async (taskId) => {
        try {
            console.log("handleAdminConfirmCompletion called");
            console.log("User:", user);  // Log the user object
            console.log("Token:", localStorage.getItem('token')); // Log the token
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tasks/${taskId}/confirm`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to confirm completion', errorData);
                setMessage(`Failed to confirm completion: ${response.status} - ${errorData.message || 'Unknown error'}`);
                return;
            }

            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task._id === taskId ? { ...task, status: "completed" } : task
                )
            );

        } catch (error) {
            console.error('Error confirming completion:', error);
            setMessage('Error confirming task completion');
        }
    };

    return (
        <div className="tasks-container container mt-4">
            <h3 className="mb-4 text-center">Your Tasks</h3>
            {message && (
                <Alert variant="danger" className="mt-3">
                    {message}
                </Alert>
            )}
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

{["admin", "staff"].includes(user?.role) && task.status !== "completed" && (
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

{task.status === "completed" && (
    <div className="mt-3">
        <Button variant="success" size="sm" disabled>
            Completed
        </Button>
    </div>
)}

                                                {user?.role === "admin" && task.status === "pending_confirmation" && (
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        className="mt-2"
                                                        onClick={() => handleAdminConfirmCompletion(task._id)} // Changed function call
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