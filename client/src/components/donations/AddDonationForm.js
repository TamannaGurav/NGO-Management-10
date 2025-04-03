import React, { useState } from "react"; // ✅ Import useState
import { createDonation } from "../../api/donationApi"; // ✅ Import createDonation
import { Form, Button, Card } from "react-bootstrap"; // ✅ Import Bootstrap components
import "bootstrap/dist/css/bootstrap.min.css"; // ✅ Ensure Bootstrap is included


const AddDonationForm = ({ token, addDonationToList }) => {
  const userToken = token || localStorage.getItem("token");
  const [donationData, setDonationData] = useState({
    donorName: "",
    donorEmail: "",
    amount: "",
    paymentMethod: "Cash",
  });

  const handleChange = (e) => {
    setDonationData({ ...donationData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 🔥 Call API to create donation
      const newDonation = await createDonation(userToken, donationData);

      // ✅ Update the list immediately without refresh
      addDonationToList(newDonation);

      // Reset the form
      setDonationData({ donorName: "", donorEmail: "", amount: "", paymentMethod: "Cash" });
    } catch (error) {
      console.error("❌ Error adding donation:", error.response?.data || error);
    }
  };

  return (
    <Card className="shadow-sm border-0 p-4 mt-4" style={{ borderRadius: "10px" }}>
      <Card.Title className="text-primary fw-bold">Add New Donation</Card.Title>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Donor Name</Form.Label>
          <Form.Control
            type="text"
            name="donorName"
            placeholder="Enter donor's name"
            value={donationData.donorName}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Donor Email</Form.Label>
          <Form.Control
            type="email"
            name="donorEmail"
            placeholder="Enter donor's email"
            value={donationData.donorEmail}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Amount (₹)</Form.Label>
          <Form.Control
            type="number"
            name="amount"
            placeholder="Enter donation amount"
            value={donationData.amount}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Payment Method</Form.Label>
          <Form.Select name="paymentMethod" value={donationData.paymentMethod} onChange={handleChange}>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cheque">Cheque</option>
            <option value="CSR">CSR</option>
          </Form.Select>
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100">
          Add Donation
        </Button>
      </Form>
    </Card>
  );
};

export default AddDonationForm;
