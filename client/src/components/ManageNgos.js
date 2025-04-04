import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Alert,
  Spinner,
  Form,
  Modal,
  Row,
  Col,
  Badge
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const ManageNGOs = () => {
  const [pendingNGOs, setPendingNGOs] = useState([]);
  const [approvedNGOs, setApprovedNGOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvalLoading, setApprovalLoading] = useState(null);
  const [rejectionLoading, setRejectionLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmNgoId, setConfirmNgoId] = useState(null);
  const [confirmAction, setConfirmAction] = useState("");
  const [showNgoDetails, setShowNgoDetails] = useState(false);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [documents, setDocuments] = useState([]);

  const fetchNGOs = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in again.");

      const headers = { Authorization: `Bearer ${token}` };
      const [pendingRes, approvedRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/ngos/pending`, { headers }),
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/ngos/approved`, { headers })
      ]);

      // Handle both response formats
      setPendingNGOs(pendingRes.data.ngos || pendingRes.data || []);
      setApprovedNGOs(approvedRes.data.ngos || approvedRes.data || []);
    } catch (err) {
      setError("Failed to fetch NGOs. Please try again.");
      console.error("Error fetching NGOs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNGOs(); }, [fetchNGOs]);

  const fetchDocuments = async (ngoId) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/ngos/${ngoId}/documents`,
        { headers }
      );
      setDocuments(response.data.documents || []);
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  const handleAction = async (action, ngoId) => {
    const loadingState = action === "approve" 
      ? setApprovalLoading 
      : setRejectionLoading;
    
    try {
      loadingState(ngoId);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const endpoint = action === "approve" ? "approve" : "reject";
      
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/ngos/${ngoId}/${endpoint}`,
        {},
        { headers }
      );
      
      alert(`NGO ${action === "approve" ? "Approved" : "Rejected"}!`);
      fetchNGOs();
    } catch (err) {
      console.error(`Error ${action} NGO:`, err);
      alert(`Error ${action} NGO.`);
    } finally {
      loadingState(null);
    }
  };

  const handleView = async (ngo) => {
    setSelectedNgo(ngo);
    await fetchDocuments(ngo._id);
    setShowNgoDetails(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredNGOs = (ngos) => 
    ngos.filter(ngo => 
      ngo.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="container-fluid p-4">
      <h2>Manage NGOs</h2>
      
      <Form.Control
        type="text"
        placeholder="Search NGOs..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
      />

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <>
          {/* Pending NGOs Table */}
          <h3>Pending NGOs</h3>
          {filteredNGOs(pendingNGOs).length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>NGO Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNGOs(pendingNGOs).map(ngo => (
                  <tr key={ngo._id}>
                    <td>{ngo.name}</td>
                    <td>
                      <Button
                        variant="primary"
                        onClick={() => handleView(ngo)}
                        className="me-2"
                      >
                        View
                      </Button>
                      <Button
                        variant="success"
                        disabled={approvalLoading === ngo._id}
                        onClick={() => {
                          setConfirmNgoId(ngo._id);
                          setConfirmAction("approve");
                          setShowConfirmation(true);
                        }}
                      >
                        {approvalLoading === ngo._id ? (
                          <Spinner size="sm" />
                        ) : "Approve"}
                      </Button>
                      <Button
                        variant="danger"
                        disabled={rejectionLoading === ngo._id}
                        onClick={() => {
                          setConfirmNgoId(ngo._id);
                          setConfirmAction("reject");
                          setShowConfirmation(true);
                        }}
                        className="ms-2"
                      >
                        {rejectionLoading === ngo._id ? (
                          <Spinner size="sm" />
                        ) : "Reject"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : <p>No pending NGOs</p>}

          {/* Approved NGOs Table */}
          <h3 className="mt-4">Approved NGOs</h3>
          {filteredNGOs(approvedNGOs).length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>NGO Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNGOs(approvedNGOs).map(ngo => (
                  <tr key={ngo._id}>
                    <td>{ngo.name}</td>
                    <td>
                      <Button
                        variant="primary"
                        onClick={() => handleView(ngo)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : <p>No approved NGOs</p>}
        </>
      )}

      {/* Confirmation Modal */}
      <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm {confirmAction}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to {confirmAction} this NGO?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
            Cancel
          </Button>
          <Button 
            variant={confirmAction === "approve" ? "success" : "danger"} 
            onClick={() => {
              handleAction(confirmAction, confirmNgoId);
              setShowConfirmation(false);
            }}
          >
            Confirm {confirmAction}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* NGO Details Modal */}
      <Modal size="lg" show={showNgoDetails} onHide={() => setShowNgoDetails(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedNgo?.name} Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNgo && (
            <Row>
              <Col md={6}>
                <h5>Basic Information</h5>
                <p><strong>Name:</strong> {selectedNgo.name}</p>
                <p><strong>Registration:</strong> {selectedNgo.registrationNumber || 'N/A'}</p>
                <p><strong>Address:</strong> {selectedNgo.address}</p>
                <p><strong>Founded:</strong> {formatDate(selectedNgo.createdAt)}</p>
                <p><strong>Status:</strong>{" "}
                  <Badge bg={selectedNgo.status === "approved" ? "success" : "warning"}>
                    {selectedNgo.status}
                  </Badge>
                </p>
              </Col>
              
              <Col md={6}>
                <h5>Contact Information</h5>
                <p><strong>Email:</strong> {selectedNgo.contactEmail}</p>
                <p><strong>Phone:</strong> {selectedNgo.phone || 'N/A'}</p>
                <p><strong>Website:</strong>{" "}
                  {selectedNgo.website ? (
                    <a href={selectedNgo.website} target="_blank" rel="noreferrer">
                      {selectedNgo.website}
                    </a>
                  ) : 'N/A'}
                </p>
                <p><strong>Admin Name:</strong> {selectedNgo.adminName}</p>
                <p><strong>Admin Email:</strong> {selectedNgo.adminEmail}</p>
              </Col>

              {documents.length > 0 && (
                <Col xs={12} className="mt-4">
                  <h5>Documents</h5>
                  {documents.map((doc, index) => (
                    <div key={index} className="mb-2">
                      <Badge bg="info" className="me-2">{doc.documentType}</Badge>
                      <a href={doc.documentUrl} target="_blank" rel="noreferrer">
                        View Document
                      </a>
                    </div>
                  ))}
                </Col>
              )}
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNgoDetails(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageNGOs;