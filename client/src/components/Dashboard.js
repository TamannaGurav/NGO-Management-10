import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Offcanvas, Button } from 'react-bootstrap';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import ChangePassword from './ChangePassword';
import { useLocation } from 'react-router-dom';

import '../styles/Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log("User Data:", parsedUser); // Debugging user data
      setUser(parsedUser);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Define role-based sidebar links
  const sidebarLinks = {
    'super_admin': [
      { path: '/dashboard/ngos', label: 'Manage NGOs' },
      { path: '/dashboard/tasks', label: 'Tasks' },
      { path: '/dashboard/members', label: 'Members' },
      { path: '/dashboard/donations', label: 'Donations' },
      { path: '/dashboard/events', label: 'Events' },
      { path: '/dashboard/reports', label: 'Reports' },
      { path: '/dashboard/settings', label: 'Settings' },
      { path: '/dashboard/change-password', label: 'Change Password' }, // Added

    ],
    'admin': [
      { path: '/dashboard/tasks', label: 'Tasks' },
      { path: '/dashboard/members', label: 'Members' },
      { path: '/dashboard/donations', label: 'Donations' },
      { path: '/dashboard/events', label: 'Events' },
      { path: '/dashboard/reports', label: 'Reports' },
      { path: '/dashboard/change-password', label: 'Change Password' }, // Added

    ],
    'staff': [
      { path: '/dashboard/tasks', label: 'Tasks' },
      { path: '/dashboard/donations', label: 'Donations' },
      { path: '/dashboard/events', label: 'Events' },
      { path: '/dashboard/change-password', label: 'Change Password' }, // Added

    ],
    'volunteer': [
      { path: '/dashboard/tasks', label: 'Tasks' },
      { path: '/dashboard/events', label: 'Events' },
      { path: '/dashboard/change-password', label: 'Change Password' }, // Added

    ],
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/login', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const location = useLocation(); // Get current URL

  return (
    <>
      {/* Fixed Top Navbar */}
      <Navbar bg="primary" variant="dark" expand={false} fixed="top">
        <Container fluid>
          <Button variant="primary" onClick={() => setShowSidebar(true)} className="me-2">
            ☰
          </Button>
          <Navbar.Brand as={Link} to="/dashboard">
            {user?.name ? `Welcome, ${user.name}` : 'NGO Dashboard'}
          </Navbar.Brand>
          <Button variant="danger" onClick={handleLogout}>Logout</Button>
        </Container>
      </Navbar>

      {/* Offcanvas Sidebar for Mobile & Desktop Toggle */}
      <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} backdrop={true} scroll={false} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {user && user.role ? (
            sidebarLinks[user.role]?.map((link) => (
              <Nav.Link 
                as={Link} 
                to={link.path} 
                key={link.path} 
                onClick={() => setShowSidebar(false)}
                className={location.pathname === link.path ? 'active' : ''}
              >
                {link.label}
              </Nav.Link>
            ))
          ) : (
            <p>No links available - Check user role</p>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Main Content Area */}
      <div className="dashboard-content">
        <Container>
          <Outlet /> {/* This will render the nested route component like Tasks, Donations, etc. */}
        </Container>
      </div>
    </>
  );
};

export default Dashboard;
{/* <div className="dashboard-content">
<Container>
    <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Outlet />} />
    </Routes>
</Container>
</div> */}