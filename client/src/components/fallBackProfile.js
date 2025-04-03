import React, { useState, useEffect } from 'react';
import { Button, Form, Card, Container } from 'react-bootstrap';
import {
  User, Mail, Cake, Phone, Briefcase, MapPin, Edit, Save, X, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      <Container className="mt-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '16rem' }}>
          <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
        </div>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container className="mt-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h1 className="text-center text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
        My Profile
      </h1>

      {!userProfile ? (
        <div className="text-center text-gray-400">No profile data available.</div>
      ) : (
        <Card className="bg-black/50 border border-white/10 shadow-lg backdrop-blur-md">
          <Card.Header>
            <Card.Title className="text-2xl font-semibold text-white d-flex align-items-center gap-2">
              <User className="w-6 h-6" />
              Profile Information
            </Card.Title>
            <Card.Subtitle className="text-gray-300">View and edit your personal information.</Card.Subtitle>
          </Card.Header>

          <Card.Body>
            {/* Profile Avatar */}
            <div className="d-flex flex-column flex-sm-row align-items-center gap-3 mb-4">
              <div className="rounded-circle overflow-hidden" style={{ width: '6rem', height: '6rem', border: '2px solid rgba(128,0,128,0.3)' }}>
                <img src={userProfile.avatarUrl} alt={userProfile.name} className="w-100 h-100 object-fit-cover rounded-circle" />
              </div>
              <div>
                <h2 className="h4 font-semibold text-white">{userProfile.name}</h2>
                <p className="text-gray-400">{userProfile.occupation}</p>
                <p className="text-gray-400 d-flex align-items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {userProfile.location}
                </p>
              </div>
            </div>

            {/* Profile Form */}
            <div className="row g-3">
              {['name', 'email', 'dob', 'phone', 'occupation', 'location'].map((field) => (
                <Form.Group key={field} className="col-md-6">
                  <Form.Label className="text-sm font-medium text-gray-200">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </Form.Label>
                  <Form.Control
                    type={field === 'dob' ? 'date' : field === 'email' ? 'email' : 'text'}
                    value={tempProfile ? tempProfile[field] : ''}
                    onChange={(e) => handleChange(e, field)}
                    disabled={!isEditing}
                    className={isEditing ? 'border-purple-500' : 'bg-gray-700 text-gray-300'}
                  />
                </Form.Group>
              ))}
            </div>
          </Card.Body>

          {/* Buttons */}
          <Card.Footer className="d-flex justify-content-end">
            <AnimatePresence>
              {isEditing ? (
                <>
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="me-2">
                    <Button variant="outline" onClick={handleCancel} className="bg-danger bg-opacity-20 text-danger border-danger">
                      <X className="w-4 h-4 me-2" />
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <Button onClick={handleSave} className="bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg">
                      <Save className="w-4 h-4 me-2" />
                      Save
                    </Button>
                  </motion.div>
                </>
              ) : (
                <Button variant="outline" onClick={handleEdit} className="bg-info bg-opacity-20 text-info border-info">
                  <Edit className="w-4 h-4 me-2" />
                  Edit Profile
                </Button>
              )}
            </AnimatePresence>
          </Card.Footer>
        </Card>
      )}
    </Container>
  );
};

export default ProfilePage;
