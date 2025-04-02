import React, { useState } from 'react';
import { Button, Form, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

library.add(faEye, faEyeSlash);

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [variant, setVariant] = useState('');
    const [loading, setLoading] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const navigate = useNavigate();

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);
        setVariant('');

        if (newPassword !== confirmNewPassword) {
            setMessage('New passwords do not match');
            setVariant('danger');
            setLoading(false);
            return;
        }

        if (newPassword.length < 8) {
            setMessage('New password must be at least 8 characters long');
            setVariant('danger');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ oldPassword, newPassword }),
            });

            // Check for a successful response (status in the range 200-299)
            if (!response.ok) {
                // If the response is not ok, try to get the error message from the response
                let errorMessage = 'Failed to change password';
                try {
                    const errorData = await response.json();
                     if (typeof errorData === 'object' && errorData !== null && errorData.message) {
                        errorMessage = errorData.message;
                    } else {
                         const text = await response.text();
                         errorMessage = `Failed to change password. Server responded with: ${response.status} - ${text}`;
                    }
                } catch (error) {
                    const text = await response.text();
                    errorMessage = `Failed to change password. Server responded with: ${response.status} - ${text}`;
                }
                setMessage(errorMessage);
                setVariant('danger');
                setLoading(false);
                return;
            }

            const data = await response.json();

            setMessage(data.message);
            setVariant('success');
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setTimeout(() => {
                navigate('/dashboard/profile');
            }, 2000);

        } catch (error) {
            console.error('Error changing password:', error);
            setMessage('An error occurred while changing password');
            setVariant('danger');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="change-password-container">
            <Card className="change-password-card">
                <Card.Body>
                    <Card.Title>Change Password</Card.Title>
                    <Form onSubmit={handleChangePassword}>
                        <Form.Group className="mb-3" controlId="formOldPassword">
                            <Form.Label>Old Password</Form.Label>
                            <div className="input-group">
                                <Form.Control
                                    type={showOldPassword ? 'text' : 'password'}
                                    placeholder="Enter your old password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                />
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                >
                                    <FontAwesomeIcon icon={showOldPassword ? faEyeSlash : faEye} />
                                </Button>
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formNewPassword">
                            <Form.Label>New Password</Form.Label>
                            <div className="input-group">
                                <Form.Control
                                    type={showNewPassword ? 'text' : 'password'}
                                    placeholder="Enter your new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                                </Button>
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formConfirmNewPassword">
                            <Form.Label>Confirm New Password</Form.Label>
                            <div className="input-group">
                                <Form.Control
                                    type={showConfirmNewPassword ? 'text' : 'password'}
                                    placeholder="Confirm your new password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    required
                                />
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                >
                                    <FontAwesomeIcon icon={showConfirmNewPassword ? faEyeSlash : faEye} />
                                </Button>
                            </div>
                        </Form.Group>

                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Changing...' : 'Change Password'}
                        </Button>
                    </Form>
                    {message && <Alert variant={variant} className="mt-3">{message}</Alert>}
                </Card.Body>
            </Card>
        </div>
    );
};

export default ChangePassword;
