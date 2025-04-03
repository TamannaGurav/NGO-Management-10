import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Alert, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const ManageNGOs = () => {
    const [pendingNGOs, setPendingNGOs] = useState([]);
    const [approvedNGOs, setApprovedNGOs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [approvalLoading, setApprovalLoading] = useState(null); // Track approval loading state
    const [rejectionLoading, setRejectionLoading] = useState(null); // Track rejection loading state

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
        setApprovalLoading(ngoId); // Set loading for this NGO
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
            setApprovalLoading(null); // Reset loading state
        }
    };

    const handleReject = async (ngoId) => {
        setRejectionLoading(ngoId); // Set loading for this NGO
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
            setRejectionLoading(null); // Reset loading state
        }
    };

    return (
        <div>
            <h2>Manage NGOs</h2>

            {loading && <p>Loading...</p>}

            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && !error && (
                <>
                    <h3>Pending NGOs</h3>
                    {pendingNGOs.length > 0 ? (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>NGO Name</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingNGOs.map((ngo) => (
                                    <tr key={ngo._id}>
                                        <td>{ngo.name}</td>
                                        <td>
                                            <Button
                                                variant="success"
                                                onClick={() => handleApprove(ngo._id)}
                                                disabled={approvalLoading === ngo._id}
                                            >
                                                {approvalLoading === ngo._id ? <Spinner size="sm" /> : "Approve"}
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() => handleReject(ngo._id)}
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
                    {approvedNGOs.length > 0 ? (
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>NGO Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {approvedNGOs.map((ngo) => (
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
        </div>
    );
};

export default ManageNGOs;