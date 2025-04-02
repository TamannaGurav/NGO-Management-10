// src/components/Profile.js

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap'; // Import Bootstrap components

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    return <p>User data not found.</p>;
  }

  return (
    <div className="profile-container">
      <Card className="profile-card">
        <Card.Body>
          <Card.Title>Your Profile</Card.Title>
          <Card.Text>
            <strong>Name:</strong> {user.name}
          </Card.Text>
          <Card.Text>
            <strong>Email:</strong> {user.email}
          </Card.Text>
          <Card.Text>
            <strong>Role:</strong> {user.role}
          </Card.Text>
          <Button as={Link} to="/dashboard/change-password" variant="primary">
            Change Password
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Profile;