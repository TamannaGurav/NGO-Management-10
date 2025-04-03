import React from "react";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import "bootstrap/dist/css/bootstrap.min.css";

const DonationCard = ({ donation }) => {
  return (
    <Card className="shadow-sm border-0 mb-3" style={{ borderRadius: "10px", overflow: "hidden" }}>
      <Card.Body>
        <Card.Title className="text-primary fw-bold">
          {donation.donorName} <span className="text-dark">donated</span> ₹{donation.amount}
        </Card.Title>

        <Card.Text>
          <strong>Email:</strong> {donation.donorEmail} <br />
          <strong>Payment Method:</strong> {donation.paymentMethod} <br />
          <strong>Status:</strong>
          <Badge bg={donation.status === "Completed" ? "success" : "warning"} className="ms-2">
            {donation.status}
          </Badge>
        </Card.Text>

        <Card.Footer className="text-muted text-end">
          <small>{new Date(donation.date).toLocaleDateString()}</small>
        </Card.Footer>
      </Card.Body>
    </Card>
  );
};

export default DonationCard;