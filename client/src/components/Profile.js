import React, { useState, useEffect } from 'react';
import { Button, Form, Container } from 'react-bootstrap';
import {
    User,
    Mail,
    Cake,
    Phone,
    Briefcase,
    MapPin,
    Edit,
    Save,
    X,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/ProfilePage.css'; // Import custom CSS (create this file)

const ProfilePage = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tempProfile, setTempProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || '');

    // Fetch profile data
    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) return setError('Authentication token is missing.');

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/me`, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                });

                if (!response.ok) throw new Error(`Failed to fetch profile: ${response.status}`);

                const data = await response.json();
                setUserProfile(data);
                setTempProfile(data);
            } catch (err) {
                setError(err.message || 'Error fetching profile data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [token]);

    // Edit mode toggle
    const handleEdit = () => {
        setTempProfile(userProfile);
        setIsEditing(true);
    };

    // Save profile changes
    const handleSave = async () => {
        if (!tempProfile || !token) return setError('No profile data to save or token missing.');

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/members/${tempProfile._id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: tempProfile.name,
                    email: tempProfile.email,
                    phone: tempProfile.phone,
                    occupation: tempProfile.occupation,
                    location: tempProfile.location,
                }),
            });

            if (!response.ok) throw new Error(`Failed to save profile: ${response.status}`);

            const updatedUser = await response.json();
            setUserProfile({ ...userProfile, ...updatedUser.member });
            setIsEditing(false);
        } catch (err) {
            setError(err.message || 'Failed to save profile data.');
        } finally {
            setIsLoading(false);
        }
    };

    // Cancel editing
    const handleCancel = () => {
        setIsEditing(false);
        setTempProfile(userProfile);
    };

    // Handle input changes
    const handleChange = (e, field) => {
        setTempProfile((prev) => ({ ...prev, [field]: e.target.value }));
    };

    // Loading state
    if (isLoading) {
        return (
            <Container className="mt-5">
                <div className="d-flex justify-content-center align-items-center" style={{ height: '20rem' }}>
                    <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
                </div>
            </Container>
        );
    }

    // Error state
    if (error) {
        return (
            <Container className="mt-5">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="alert alert-danger shadow-lg"
                    role="alert"
                >
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </motion.div>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <h1 className="text-center display-3 font-weight-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400 mb-5">
                My Profile
            </h1>

            {!userProfile ? (
                <div className="text-center text-muted">No profile data available.</div>
            ) : (
                <div className="profile-container">
                    {/* Header */}
                    <div className="profile-header">
                        <div className="d-flex align-items-center gap-4">
                            <User className="profile-icon" />
                            <div className="flex-grow-1">
                                <h2 className="profile-title">
                                    Profile Information
                                </h2>
                                <p className="profile-subtitle">
                                    View and edit your personal information.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="profile-body">
                        <div className="d-flex flex-column flex-sm-row align-items-center gap-5 mb-7">
                            <div
                                className="profile-avatar"
                            >
                                <motion.img
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                    src={userProfile.avatarUrl}
                                    alt={userProfile.name}
                                    className="w-100 h-100 object-fit-cover rounded-circle"
                                />
                            </div>
                            <div className='w-100'>
                                <h2 className="profile-name">{userProfile.name}</h2>
                                <p className="profile-occupation">{userProfile.occupation}</p>
                                <p className="profile-location d-flex align-items-center gap-2">
                                    <MapPin className="profile-location-icon" />
                                    {userProfile.location}
                                </p>
                            </div>
                        </div>

                        <Form className="profile-form">
                            <div className="row g-4">
                                {/* Form Fields */}
                                {['name', 'email', 'dob', 'phone', 'occupation', 'location'].map((field) => (
                                    <Form.Group key={field} className="col-12 col-md-6">
                                        <Form.Label className="profile-label">
                                            {field.charAt(0).toUpperCase() + field.slice(1)}
                                        </Form.Label>
                                        <Form.Control
                                            type={field === 'dob' ? 'date' : field === 'email' ? 'email' : 'text'}
                                            value={tempProfile ? tempProfile[field] : ''}
                                            onChange={(e) => handleChange(e, field)}
                                            disabled={!isEditing}
                                            className={
                                                isEditing
                                                    ? 'form-control form-control-lg edit-mode-input'
                                                    : 'form-control form-control-lg view-mode-input'
                                            }
                                            placeholder={`Enter your ${field}`}
                                        />
                                    </Form.Group>
                                ))}
                            </div>
                        </Form>
                    </div>

                    {/* Footer */}
                    <div className="profile-footer d-flex justify-content-end p-4 rounded-b-lg">
                        <AnimatePresence>
                            {isEditing ? (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="me-2"
                                    >
                                        <Button
                                            variant="outline-danger"
                                            className="profile-cancel-button"
                                            disabled={isLoading}
                                        >
                                            <X className="w-5 h-5 me-2" />
                                            Cancel
                                        </Button>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                    >
                                        <Button
                                            onClick={handleSave}
                                            className="profile-save-button"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 me-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-5 h-5 me-2" />
                                                    Save
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
                                </>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Button
                                        variant="outline-info"
                                        className="profile-edit-button"
                                        onClick={handleEdit}
                                    >
                                        <Edit className="w-5 h-5 me-2" />
                                        Edit Profile
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </Container>
    );
};

export default ProfilePage;
