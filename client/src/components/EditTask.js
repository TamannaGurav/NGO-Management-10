import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
// import '../styles/EditTask.css';

const EditTask = () => {
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { taskId } = useParams();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [assignedTo, setAssignedTo] = useState('');

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tasks/${taskId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch task: ${response.status}`);
                }

                const taskData = await response.json();
                setTask(taskData);
                setTitle(taskData.title);
                setDescription(taskData.description);
                setDueDate(new Date(taskData.dueDate).toISOString().split('T')[0]);
                setAssignedTo(taskData.assignedTo);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTask();
    }, [taskId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    dueDate,
                    assignedTo
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update task');
            }

            navigate('/tasks');
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <Alert variant="danger">{error}</Alert>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="container mt-4">
                <Alert variant="warning">Task not found.</Alert>
            </div>
        );
    }

    return (
        <div className="edit-task-container container mt-4">
            <h2 className="mb-4">Edit Task</h2>
            <Card className="shadow-lg">
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="title">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="description">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="dueDate">
                            <Form.Label>Due Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="assignedTo">
                            <Form.Label>Assigned To</Form.Label>
                            <Form.Control
                                type="text"
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            Update Task
                        </Button>
                        <Button variant="secondary" className="ms-2" onClick={() => navigate('/tasks')}>
                            Cancel
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default EditTask;

