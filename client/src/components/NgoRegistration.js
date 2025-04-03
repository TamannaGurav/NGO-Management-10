import { useState } from "react";
import axios from "axios";

const NGORegistration = () => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactEmail: "",
    adminName: "",
    adminEmail: "",
  });

  const [message, setMessage] = useState(""); // Success/Error Message
  const [loading, setLoading] = useState(false); // Loading State

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/ngos/request",
        formData
      );
      setMessage(response.data.message);
      setFormData({
        name: "",
        address: "",
        contactEmail: "",
        adminName: "",
        adminEmail: "",
      });
    } catch (error) {
      setMessage(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h2>NGO Registration</h2>
      <form onSubmit={handleSubmit}>
        <label>NGO Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label>Address:</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />

        <label>Contact Email:</label>
        <input
          type="email"
          name="contactEmail"
          value={formData.contactEmail}
          onChange={handleChange}
          required
        />

        <label>Admin Name:</label>
        <input
          type="text"
          name="adminName"
          value={formData.adminName}
          onChange={handleChange}
          required
        />

        <label>Admin Email:</label>
        <input
          type="email"
          name="adminEmail"
          value={formData.adminEmail}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Register NGO"}
        </button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default NGORegistration;
