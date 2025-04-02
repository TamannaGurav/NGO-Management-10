import React, { useState, useEffect } from 'react';
import { Card, Button, ListGroup, Dropdown, Spinner, Alert, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/Tasks.css';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editedTask, setEditedTask] = useState({});

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
                let errorMessage = `Failed to update status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.message) {
                        errorMessage += ` - ${errorData.message}`;
                    }
                } catch (jsonError) {
                    console.error("Error parsing JSON error response", jsonError);
                }
                setMessage(errorMessage);
                console.error('Failed to update status', errorMessage);
                return;
            }

            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task._id === taskId ? { ...task, status: newStatus } : task
                )
            );

        } catch (error) {
            console.error('Error updating status:', error);
            setMessage('Error updating task status');
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
            console.log("User:", user);
            console.log("Token:", localStorage.getItem('token'));
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

    const handleEditTask = (task) => {
        setEditingTaskId(task._id);
        setEditedTask({
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            assignedTo: task.assignedTo,
            status: task.status
        });
    };

    const handleCancelEdit = () => {
        setEditingTaskId(null);
        setEditedTask({});
    };

    const handleSaveEdit = async (taskId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(editedTask),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to update task', errorData);
                setMessage(`Failed to update task: ${response.status} - ${errorData.message || 'Unknown error'}`);
                return;
            }

            const updatedTask = await response.json();

            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task._id === taskId ? { ...updatedTask.task } : task
                )
            );
            setEditingTaskId(null);
            setEditedTask({});
            setMessage('Task updated successfully!');
        } catch (error) {
            console.error('Error updating task:', error);
            setMessage('Error updating task');
        }
    };

    const handleInputChange = (e) => {
        setEditedTask({ ...editedTask, [e.target.name]: e.target.value });
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
                                                {editingTaskId === task._id ? (
                                                    <>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Title</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="title"
                                                                value={editedTask.title || ""}
                                                                onChange={handleInputChange}
                                                            />
                                                        </Form.Group>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Description</Form.Label>
                                                            <Form.Control
                                                                as="textarea"
                                                                name="description"
                                                                value={editedTask.description || ""}
                                                                onChange={handleInputChange}
                                                            />
                                                        </Form.Group>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Due Date</Form.Label>
                                                            <Form.Control
                                                                type="date"
                                                                name="dueDate"
                                                                value={editedTask.dueDate ? new Date(editedTask.dueDate).toISOString().split('T')[0] : ''}
                                                                onChange={handleInputChange}
                                                            />
                                                        </Form.Group>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Assigned To</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="assignedTo"
                                                                value={editedTask.assignedTo || ""}
                                                                onChange={handleInputChange}
                                                                disabled
                                                            />
                                                        </Form.Group>
                                                        <Form.Group className="mb-3">
                                                            <Form.Label>Status</Form.Label>
                                                            <Form.Control
                                                                as="select"
                                                                name="status"
                                                                value={editedTask.status || ""}
                                                                onChange={handleInputChange}
                                                            >
                                                                <option value="pending">Pending</option>
                                                                <option value="in-progress">In Progress</option>
                                                                <option value="completed">Completed</option>
                                                            </Form.Control>
                                                        </Form.Group>
                                                        <div className="d-flex justify-content-end">

                                                            <Button variant="secondary" className="me-2" onClick={handleCancelEdit}>
                                                                Cancel
                                                            </Button>
                                                            <Button variant="primary" onClick={() => handleSaveEdit(task._id)}>
                                                                Save
                                                            </Button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
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
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    className="me-2"
                                                                    onClick={() => handleEditTask(task)}
                                                                >
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
                                                                onClick={() => handleAdminConfirmCompletion(task._id)}
                                                            >
                                                                Confirm Completion
                                                            </Button>
                                                        )}
                                                    </>
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
