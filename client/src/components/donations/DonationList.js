import { useEffect, useState } from "react";
import { getAllDonations } from "../../api/donationApi";
import DonationCard from "./DonationCard";
import AddDonationForm from "./AddDonationForm";

const DonationList = () => {
  const [donations, setDonations] = useState([]);
  const token = localStorage.getItem("token"); // Retrieve token

  // ✅ Move fetchDonations outside of useEffect so it can be reused
  const fetchDonations = async () => {
    try {
      const data = await getAllDonations(token);
      console.log("Fetched Donations Data:", data); // Debugging
      setDonations(data);
    } catch (error) {
      console.error("❌ Fetch Donations Error:", error.response?.data || error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDonations();
    } else {
      console.error("❌ No token found in localStorage.");
    }
  }, [token]);

  

  if (!Array.isArray(donations)) {
    console.error("🚨 donations is not an array:", donations); // Debugging
    return <div>Error loading donations</div>;
  }

  return (
    <div><br></br>
      <h2>Donations List</h2>

      {/* ✅ Now fetchDonations is correctly passed
      <AddDonationForm token={token} refreshDonations={fetchDonations} /> */}

      <ul>
        {donations.length === 0 ? (
          <p>No donations recorded yet.</p>
        ) : (
          donations.map((donation) => (
            <li key={donation._id}>
              {donation.donorName} - ₹{donation.amount.toLocaleString("en-IN")}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default DonationList;
