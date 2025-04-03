import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageNGOs = () => {
    const [pendingNGOs, setPendingNGOs] = useState([]);  // ✅ Default to empty array
    const [approvedNGOs, setApprovedNGOs] = useState([]); // ✅ Default to empty array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchNGOs = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No token found. Please log in again.");
                }

                const headers = { Authorization: `Bearer ${token}` };

                // Fetch pending NGOs
                const pendingRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/ngos/pending`, {
                    headers,
                    withCredentials: true,
                });
                setPendingNGOs(pendingRes.data.ngos || pendingRes.data || []);  // ✅ Handle both structures

                // Fetch approved NGOs
                const approvedRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/ngos/approved`, {
                    headers,
                    withCredentials: true,
                });
                setApprovedNGOs(approvedRes.data.ngos || approvedRes.data || []);  // ✅ Handle both structures

            } catch (err) {
                setError("Failed to fetch NGOs. Please try again.");
                console.error("❌ Error fetching NGOs:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNGOs();
    }, []);

    return (
        <div>
            <h2>Manage NGOs</h2>

            {loading && <p>Loading...</p>}

            {error && <p style={{ color: "red" }}>{error}</p>}

            {!loading && !error && (
                <>
                    <h3>Pending NGOs</h3>
                    {pendingNGOs.length > 0 ? (
                        <ul>
                            {pendingNGOs.map((ngo) => (
                                <li key={ngo._id}>{ngo.name}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No pending NGOs.</p>
                    )}

                    <h3>Approved NGOs</h3>
                    {approvedNGOs.length > 0 ? (
                        <ul>
                            {approvedNGOs.map((ngo) => (
                                <li key={ngo._id}>{ngo.name}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No approved NGOs.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default ManageNGOs;
