import React from 'react';
import Login from './components/Login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import Volunteers from './components/Volunteers'; // Example of another page
import Profile from './components/Profile'; // Example of a profile page
import ChangePassword from './components/ChangePassword'; // Example of a change password page
import Settings from './components/Settings'; // Example of a settings page
import ProtectedRoute from './components/ProtectedRoute'; // This ensures the route is protected
import DonationsPage from './components/donations/DonationsPage';
import NGORegistration from './components/NgoRegistration';
import ManageNGOs from './components/ManageNgos';
import EventsPage from './components/events/EventsPage';
// import EventDetails from './components/events/EventDetails';
// import EventsList from './components/events/EventsList';
// import EventCard from './components/events/EventCard';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
// import CreateEvent from './components/events/CreateEvent';


const App = () => {
  return (
    <Router>
      {/* <Routes>
        Define routes for the login and dashboard
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} >
          Define child routes for dashboard pages
          <Route path="/ngos" element={<ManageNGOs />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/members" element={<Members />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/events" element={<Events />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />

        </Route> */}
        <Routes>
        <Route path="/" element={<Login />} />
  <Route path="/login" element={<Login />} />
  <Route path="/ngo-registration" element={<NGORegistration />} /> {/* ✅ Add NGO Registration Page */}
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} >
    {/* <Route path="ngos" element={<ManageNGOs />} /> */}
    <Route path="tasks" element={<Tasks />} />
    {/* <Route path="members" element={<Members />} /> */}
    {/* <Route path="donations" element={<Donations />} /> */}
    {/* <Route path="reports" element={<Reports />} /> */}
    <Route path="settings" element={<Settings />} />
    <Route path="change-password" element={<ChangePassword />} /> {/* Add this route */}
    <Route path="ngos" element={<ManageNGOs />} />
    <Route path="profile" element={<Profile />} />
    <Route path="donations" element={<DonationsPage />} /> {/* ✅ Add this */}
    {/* <Route path="events" element={<EventsList />} />
    <Route path="events/new" element={<CreateEvent />} /> */}
    <Route path="events" element={<EventsPage />} />



  </Route>
</Routes>

      {/* </Routes>*/}
    </Router>
     
  );
};

export default App;
