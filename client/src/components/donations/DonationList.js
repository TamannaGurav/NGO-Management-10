import { useEffect, useState } from "react";
import { getAllDonations, deleteDonation } from "../../api/donationApi"; // Import delete API
import { saveAs } from "file-saver"; // For CSV export

const DonationList = () => {
  const [donations, setDonations] = useState([]);
  const [filterMethod, setFilterMethod] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const donationsPerPage = 5;

  const token = localStorage.getItem("token");

  // Fetch Donations
  const fetchDonations = async () => {
    try {
      const data = await getAllDonations(token);
      console.log("Fetched Donations Data:", data);
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
    console.error("🚨 donations is not an array:", donations);
    return <div>Error loading donations</div>;
  }

  // ✅ Calculate Total Donation Amount
  const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);

  // ✅ Filter Donations
  const filteredDonations = filterMethod === "All" 
    ? donations 
    : donations.filter(donation => donation.paymentMethod === filterMethod);

  // ✅ Search Donations
  const searchedDonations = filteredDonations.filter(donation =>
    donation.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donation.donorEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Sort Donations
  const sortedDonations = searchedDonations.sort(
    (a, b) => new Date(b.donationDate) - new Date(a.donationDate)
  );

  // ✅ Pagination
  const indexOfLastDonation = currentPage * donationsPerPage;
  const indexOfFirstDonation = indexOfLastDonation - donationsPerPage;
  const currentDonations = sortedDonations.slice(indexOfFirstDonation, indexOfLastDonation);

  // ✅ Delete Donation
  const handleDelete = async (donationId) => {
    if (!window.confirm("Are you sure you want to delete this donation?")) return;
    
    try {
      await deleteDonation(token, donationId);
      // Call API
      setDonations(donations.filter((donation) => donation._id !== donationId)); // Remove from state
      alert("Donation deleted successfully.");
    } catch (error) {
      console.error("❌ Error deleting donation:", error);
      alert("Failed to delete donation.");
    }
  };

  // ✅ Export Donations as CSV
  const exportToCSV = () => {
    const csvContent = [
      ["Donor Name", "Email", "Amount", "Payment Method", "Date"], // Headers
      ...donations.map((donation) => [
        donation.donorName,
        donation.donorEmail,
        `₹${donation.amount}`,
        donation.paymentMethod,
        new Date(donation.donationDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      ])
    ]
    .map(row => row.join(","))
    .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "donations.csv");
  };

  return (
    <div>
      <h2>Donations List</h2>
      <h3>Total Amount: ₹{totalAmount.toLocaleString("en-IN")}</h3>

      {/* ✅ Filter */}
      <label>Filter by Payment Method: </label>
      <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)}>
        <option value="All">All</option>
        <option value="credit card">Credit Card</option>
        <option value="cash">Cash</option>
        <option value="bank transfer">Bank Transfer</option>
      </select>

      {/* ✅ Search */}
      <input
        type="text"
        placeholder="Search by Name or Email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* ✅ Export CSV */}
      <button onClick={exportToCSV}>Export as CSV</button>

      {/* ✅ Donations List */}
      <ul>
        {currentDonations.length === 0 ? (
          <p>No donations recorded yet.</p>
        ) : (
          currentDonations.map((donation) => (
            <li key={donation._id}>
              <strong>{donation.donorName}</strong> - ₹{donation.amount.toLocaleString("en-IN")}
              <br />
              <small>
                Date: {donation.donationDate
                  ? new Date(donation.donationDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "No Date Available"}
              </small>
              <br />
              <small>Payment Method: {donation.paymentMethod}</small>
              <br />
              <button onClick={() => handleDelete(donation._id)}>Delete</button> {/* ✅ Delete Button */}
            </li>
          ))
        )}
      </ul>

      {/* ✅ Pagination */}
      <div>
        <button 
          onClick={() => setCurrentPage(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <span> Page {currentPage} </span>

        <button 
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={indexOfLastDonation >= sortedDonations.length}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DonationList;
