import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Card, Alert, Spinner, Container, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/NGORegistration.css"; // Import custom CSS for styling

const NGORegistration = () => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactEmail: "",
    adminName: "",
    adminEmail: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
    <Container className="ngo-registration-container">
      <Row className="justify-content-md-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="ngo-registration-card">
            <Card.Body>
              <Card.Title className="ngo-registration-title">
                NGO Registration
              </Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="ngo-registration-label">NGO Name:</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="ngo-registration-input"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="ngo-registration-label">Address:</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="ngo-registration-input"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="ngo-registration-label">
                    Contact Email:
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    required
                    className="ngo-registration-input"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="ngo-registration-label">Admin Name:</Form.Label>
                  <Form.Control
                    type="text"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleChange}
                    required
                    className="ngo-registration-input"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="ngo-registration-label">Admin Email:</Form.Label>
                  <Form.Control
                    type="email"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    required
                    className="ngo-registration-input"
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="ngo-registration-button"
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" /> Submitting...
                    </>
                  ) : (
                    "Register NGO"
                  )}
                </Button>
              </Form>

              {message && (
                <Alert
                  variant={message.includes("error") ? "danger" : "success"}
                  className="ngo-registration-message"
                >
                  {message}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NGORegistration;