import React, { useEffect, useState } from "react";
import AddDonationForm from "./AddDonationForm";
import DonationList from "./DonationList";
import { getAllDonations } from "../../api/donationApi";

const DonationsPage = () => {
  const [donations, setDonations] = useState([]);
  
  // ✅ Fetch token inside the component
  const token = localStorage.getItem("token");
  console.log("🔑 Token in localStorage:", token); // Debugging

  const fetchDonations = async () => {
    if (!token) {
      console.error("❌ No token found. Cannot fetch donations.");
      return;
    }
    try {
      const data = await getAllDonations(token);
      console.log("✅ Fetched Donations Data:", data);
      setDonations(data);
    } catch (error) {
      console.error("❌ Fetch Donations Error:", error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);
  const addDonationToList = (newDonation) => {
    setDonations((prevDonations) => [newDonation, ...prevDonations]); // Add new donation at the top
  };
  return (
    <div>
      <h1>Donation Management</h1>
      <AddDonationForm token={token} addDonationToList={addDonationToList} />      <DonationList donations={donations} refreshDonations={fetchDonations} />
    </div>
  );
};

export default DonationsPage;
