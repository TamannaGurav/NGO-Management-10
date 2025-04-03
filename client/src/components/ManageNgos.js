import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Alert, Spinner, Form, Modal } from "react-bootstrap";
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

    const fetchNGOs = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No token found. Please log in again.");
            }

            const headers = { Authorization: `Bearer ${token}` };

            const pendingRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/ngos/pending`, {
                headers,
                withCredentials: true,
            });
            setPendingNGOs(pendingRes.data.ngos || pendingRes.data || []);

            const approvedRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/ngos/approved`, {
                headers,
                withCredentials: true,
            });
            setApprovedNGOs(approvedRes.data.ngos || approvedRes.data || []);
        } catch (err) {
            setError("Failed to fetch NGOs. Please try again.");
            console.error("❌ Error fetching NGOs:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNGOs();
    }, []);

    const handleApprove = async (ngoId) => {
        setApprovalLoading(ngoId);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No token found. Please log in again.");
            }

            const headers = { Authorization: `Bearer ${token}` };

            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/ngos/${ngoId}/approve`, {}, { headers });
            alert('NGO Approved!');
            fetchNGOs();
        } catch (err) {
            console.error("❌ Error approving NGO:", err);
            alert('Error approving NGO.');
        } finally {
            setApprovalLoading(null);
        }
    };

    const handleReject = async (ngoId) => {
        setRejectionLoading(ngoId);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No token found. Please log in again.");
            }

            const headers = { Authorization: `Bearer ${token}` };

            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/ngos/${ngoId}/reject`, {}, { headers });
            alert('NGO Rejected!');
            fetchNGOs();
        } catch (err) {
            console.error("❌ Error rejecting NGO:", err);
            alert('Error rejecting NGO.');
        } finally {
            setRejectionLoading(null);
        }
    };

    const handleConfirm = async () => {
        if (confirmAction === "approve") {
            await handleApprove(confirmNgoId);
        } else if (confirmAction === "reject") {
            await handleReject(confirmNgoId);
        }
        setShowConfirmation(false);
    };

    const filteredPendingNGOs = pendingNGOs.filter((ngo) =>
        ngo.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredApprovedNGOs = approvedNGOs.filter((ngo) =>
        ngo.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <h2>Manage NGOs</h2>

            <Form.Control
                type="text"
                placeholder="Search NGOs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-3"
            />

            {loading && <p>Loading...</p>}

            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && !error && (
                <>
                    <h3>Pending NGOs</h3>
                    {filteredPendingNGOs.length > 0 ? (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>NGO Name</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody> {/* Added <tbody> here */}
                                {filteredPendingNGOs.map((ngo) => (
                                    <tr key={ngo._id}>
                                        <td>{ngo.name}</td>
                                        <td>
                                            <Button
                                                variant="success"
                                                onClick={() => {
                                                    setConfirmNgoId(ngo._id);
                                                    setConfirmAction("approve");
                                                    setShowConfirmation(true);
                                                }}
                                                disabled={approvalLoading === ngo._id}
                                            >
                                                {approvalLoading === ngo._id ? <Spinner size="sm" /> : "Approve"}
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() => {
                                                    setConfirmNgoId(ngo._id);
                                                    setConfirmAction("reject");
                                                    setShowConfirmation(true);
                                                }}
                                                disabled={rejectionLoading === ngo._id}
                                                className="ms-2"
                                            >
                                                {rejectionLoading === ngo._id ? <Spinner size="sm" /> : "Reject"}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <p>No pending NGOs.</p>
                    )}

                    <h3>Approved NGOs</h3>
                    {filteredApprovedNGOs.length > 0 ? (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>NGO Name</th>
                                </tr>
                            </thead>
                            <tbody> {/* Added <tbody> here */}
                                {filteredApprovedNGOs.map((ngo) => (
                                    <tr key={ngo._id}>
                                        <td>{ngo.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <p>No approved NGOs.</p>
                    )}
                </>
            )}

            <Modal show={showConfirmation} onHide={() => setShowConfirmation(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Action</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to {confirmAction} this NGO?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmation(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleConfirm}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ManageNGOs;