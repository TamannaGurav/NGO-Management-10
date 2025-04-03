import axios from "axios";

const API_URL = "http://localhost:5000/api/donations";

// ➤ Add a new donation
export const createDonation = async (token, donationData) => {
    console.log("Sending token:", token); // ✅ Debugging log
    const response = await axios.post(API_URL, donationData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "", // ✅ Ensure token is included
      },
    });
    return response.data;
  };
  localStorage.getItem("token");


// ➤ Get all donations
export const getAllDonations = async (token) => {
    if (!token) {
      console.error("❌ No token provided for fetching donations.");
      throw new Error("Unauthorized: No token found"); // Throw error instead of returning object
    }
  
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("✅ Donations fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching donations:", error.response?.data || error);
      throw error;
    }
  };


// ➤ Get a specific donation by ID
export const getDonationById = async (token, id) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ➤ Update a donation
export const updateDonation = async (token, id, updatedData) => {
  const response = await axios.put(`${API_URL}/${id}`, updatedData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ➤ Delete a donation (Admins only)
export const deleteDonation = async (token, id) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
