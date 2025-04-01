import React, { useState, useEffect } from 'react';
import { Card, Button, ListGroup, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // For animations
import '../styles/Tasks.css'; // Import your custom CSS for styling

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user from localStorage
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user) {
      navigate('/login'); // Redirect to login if user not found
      return;
    }

    const fetchTasks = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tasks`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const result = await response.json();
        setTasks(result); // Set fetched tasks
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [navigate]);

  return (
    <div className="tasks-container container mt-4">
      <h3 className="mb-4 text-center">Your Tasks</h3>
      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <motion.div
          className="task-list-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <Card className="shadow-lg rounded-lg">
            <Card.Body>
              {tasks.length > 0 ? (
                <ListGroup variant="flush">
                  {tasks.map((task) => (
                    <motion.div
                      key={task._id}
                      className="task-item mb-3"
                      whileHover={{ scale: 1.05, rotate: -2 }}
                      whileTap={{ scale: 0.95, rotate: 2 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <ListGroup.Item className="p-4 rounded-lg task-card">
                        <div className="d-flex justify-content-between align-items-center">
                          <h5 className="text-truncate task-title" style={{ maxWidth: '70%' }}>
                            {task.title}
                          </h5>
                          <Button variant="info" size="sm" className="view-task-btn">View Task</Button>
                        </div>
                        <p>{task.description}</p>
                        <small className="text-muted">
                          Due Date: {new Date(task.dueDate).toLocaleDateString()}
                        </small>
                      </ListGroup.Item>
                    </motion.div>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-center">No tasks available.</p>
              )}
            </Card.Body>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Tasks;
