
import React, { useState } from 'react';

const FormPanel = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    bloodGroup: '',
    organ: '',
    city: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Prepare data to send to parent: map bloodGroup -> bloodType
    const { bloodGroup, organ, city } = formData;
    onSubmit({ organ, bloodType: bloodGroup, city });
  };

  const handleReset = () => {
    setFormData({ bloodGroup: '', organ: '', city: '' });
  };

  return (
    <>
      <div className="section-header">
        <h2>Request Form</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="bloodGroup">Blood Group</label>
          <select 
            id="bloodGroup" 
            name="bloodGroup" 
            value={formData.bloodGroup} 
            onChange={handleChange}
          >
            <option value="">-- Select Blood Group --</option>
            <option>O+</option>
            <option>O-</option>
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>AB+</option>
            <option>AB-</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="organ">Organ</label>
          <select 
            id="organ" 
            name="organ" 
            value={formData.organ} 
            onChange={handleChange}
          >
            <option value="">-- Select Organ --</option>
            <option>Heart</option>
            <option>Kidney</option>
            <option>Liver</option>
            <option>Lungs</option>
            <option>Pancreas</option>
          </select>
        </div>

        {/* Removed State and Zip fields - only City is used */}
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input 
            type="text" 
            id="city" 
            name="city" 
            value={formData.city} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button type="button" className="filter-reset" onClick={handleReset}>
            Clear
          </button>
          <button type="submit" className="filter-submit">
            Submit
          </button>
        </div>
      </form>
    </>
  );
};

export default FormPanel;