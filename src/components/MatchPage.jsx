import React, { useState } from 'react';
import FormPanel from "./FormPanel";
import OrganTable from "./OrganTable";
import './Match2.css';
import DonorMap from './DonarMap.jsx';

const MatchPage = () => {
  const [organType, setOrganType] = useState("");
  const [bloodGroup, setBloodGroup] = useState(""); 
  const [city, setCity] = useState("");

  const handleFormSubmit = (formData) => {
    setOrganType(formData.organ || "");
    setBloodGroup(formData.bloodType || "");
    setCity(formData.city || "");
  };

  return (
    <div className="app">      
      <div className="dashboard-container">
        <div className="send-request-section">
          <FormPanel onSubmit={handleFormSubmit} />
        </div>
        <div className="manage-requests-section">
          {/* Pass city to OrganTable */}
          <OrganTable organType={organType} bloodGroup={bloodGroup} city={city} />
          {/* Pass all filters to DonorMap (renamed correctly) */}
          <DonorMap city={city} organType={organType} bloodGroup={bloodGroup} />
        </div>
      </div>
    </div>
  );
};

export default MatchPage;