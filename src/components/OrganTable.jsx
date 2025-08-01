import React, { useEffect, useState } from 'react';
import './OrganTable.css';

const OrganTable = ({ organType, bloodGroup, city }) => {
  const [donors, setDonors] = useState([]);
  const [poppedRow, setPoppedRow] = useState(null);

  useEffect(() => {
    if (!city) {
      setDonors([]);
      return;
    }
    const fetchDonors = async () => {
      try {
        const url = new URL("http://${process.env.REACT_APP_API_URL}/api/find-donors");
        url.searchParams.append("city", city);
        if (organType) url.searchParams.append("organ", organType);
        if (bloodGroup) url.searchParams.append("bloodType", bloodGroup);
        const res = await fetch(url);
        const data = await res.json();
        setDonors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching donors:", err);
      }
    };
    fetchDonors();
  }, [organType, bloodGroup, city]);

  const handleMatchRequest = (index) => {
    setPoppedRow(index);
    setTimeout(() => setPoppedRow(null), 100);
    alert(`Match request sent for donor: ${donors[index].name}`);
  };

  return (
    <>
      <div className="section-header">
        <h2>Available Donations</h2>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Organ</th>
              <th>City</th>
              <th>Availability</th>
              {/* Removed Compatibility column as requested */}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {donors.map((donor, index) => (
              <tr key={index} className={poppedRow === index ? 'popped-row' : ''}>
                <td>{donor.name}</td>
                <td>{donor.donationType}</td>
                <td>{donor.location}</td>
                <td>{donor.availability || 'High'}</td>
                {/* Compatibility removed */}
                <td>
                  <button
                    className="pop-btn"
                    onClick={() => handleMatchRequest(index)}
                  >
                    Match Request
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default OrganTable;