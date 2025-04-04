import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Offcanvas, Button } from 'react-bootstrap';
import { Link, useNavigate, Outlet } from 'react-router-dom';
// import ChangePassword from './ChangePassword';
import { useLocation } from 'react-router-dom';
// import DonationsPage from "../components/donations/DonationsPage"; 
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [token, setToken] = useState(null); // Added token state
  const [loadingToken, setLoadingToken] = useState(true); // Added loading state
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
    } else {
      navigate('/login');
    }
    setLoadingToken(false);

    const updateUser = () => {
      const updatedUser = localStorage.getItem('user');
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
      setToken(localStorage.getItem('token'));
    };

    window.addEventListener("userUpdated", updateUser);

    return () => {
      window.removeEventListener("userUpdated", updateUser);
    };
  }, [navigate]);

  // Define role-based sidebar links
  const sidebarLinks = {
    'super_admin': [
      { path: '/dashboard/profile', label: 'Profile' },
      { path: '/dashboard/ngos', label: 'Manage NGOs' },  // 🆕 Added this line
      // { path: '/dashboard/tasks', label: 'Tasks' },
      { path: '/dashboard/members', label: 'Members' },
      // { path: '/dashboard/donations', label: 'Donations' },
      { path: '/dashboard/events', label: 'Events' },
      { path: '/dashboard/reports', label: 'Reports' },
      { path: '/dashboard/settings', label: 'Settings' },
      { path: '/dashboard/change-password', label: 'Change Password' },
    ],
    'admin': [
      { path: '/dashboard/profile', label: 'Profile' },
      { path: '/dashboard/tasks', label: 'Tasks' },
      { path: '/dashboard/members', label: 'Members' },
      { path: '/dashboard/donations', label: 'Donations' },
      { path: '/dashboard/events', label: 'Events' },
      { path: '/dashboard/reports', label: 'Reports' },
      { path: '/dashboard/change-password', label: 'Change Password' },
    ],
    'staff': [
      { path: '/dashboard/profile', label: 'Profile' },
      { path: '/dashboard/tasks', label: 'Tasks' },
      { path: '/dashboard/donations', label: 'Donations' },
      { path: '/dashboard/events', label: 'Events' },
      { path: '/dashboard/change-password', label: 'Change Password' },
    ],
    'volunteer': [
      { path: '/dashboard/profile', label: 'Profile' },
      { path: '/dashboard/tasks', label: 'Tasks' },
      { path: '/dashboard/events', label: 'Events' },
      { path: '/dashboard/change-password', label: 'Change Password' },
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

  const AppNavbar = ({ handleLogout, setShowSidebar }) => {
    const [user, setUser] = useState(() => {
      return JSON.parse(localStorage.getItem('user')) || {};
    });

    return (
      <>
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
      </>
    );
  };

  return (
    <>
      <AppNavbar handleLogout={handleLogout} setShowSidebar={setShowSidebar} />
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

      <div className="dashboard-content">
        <Container>
          {loadingToken ? (
            <p>Loading...</p>
          ) : token ? (
            <Outlet />
          ) : (
            <p>Please log in to view content.</p>
          )}
        </Container>
      </div>
    </>
  );
};

export default Dashboard;