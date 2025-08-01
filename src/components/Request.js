import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import socket from '../socket';
import './request.css';

function Request() {
  // State for Send Request form
  const [bloodType, setBloodType] = useState('A+');
  const [quantity, setQuantity] = useState(1);
  const [urgency, setUrgency] = useState('Medium');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  // State for Manage Requests
  const [requests, setRequests] = useState([
    { id: 123, bloodType: 'A+', quantity: 5, urgency: 'High', location: 'City Hospital' },
    { id: 124, bloodType: 'O-', quantity: 3, urgency: 'Medium', location: 'General Hospital' }
  ]);
  // Blood type options
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  // Hospital list for autocomplete
  const [hospitalList, setHospitalList] = useState([]);

useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await axios.get('http://${process.env.REACT_APP_API_URL}/api/hospitals'); // Confirmed correct
        const allHospitals = res.data;

        const currentId = localStorage.getItem('hospitalId');
        const currentHospital = allHospitals.find(h => String(h.hospitalId) === String(currentId));
        if (!currentHospital) return;

        const currentCoords = await getCoords(currentHospital.location);

        const hospitalsWithinRadius = [];

        for (const h of allHospitals) {
          if (String(h.hospitalId) === String(currentId)) continue;
          const coords = await getCoords(h.location);
          const distance = haversine(currentCoords, coords);
          console.log(`Distance from ${currentHospital.location} to ${h.location}: ${distance.toFixed(2)} km`);
          if (distance <= 1000) hospitalsWithinRadius.push(h);
        }

        setHospitalList(hospitalsWithinRadius);
      } catch (err) {
        console.error('Error fetching hospitals:', err);
      }
    };

    const fetchRequests = async () => {
      try {
        const res = await axios.get('http://${process.env.REACT_APP_API_URL}/api/requests');
        const currentHospitalId = localStorage.getItem('hospitalId');
        const filtered = res.data.filter(
          r =>
            (String(r.to) === String(currentHospitalId) || String(r.from) === String(currentHospitalId))
        );
        setRequests(filtered);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    fetchHospitals();
    fetchRequests();

    const handleSocketUpdate = async () => {
      await fetchRequests();
    };

    socket.off('newBloodRequest').on('newBloodRequest', handleSocketUpdate);

    return () => {
      socket.off('newBloodRequest', handleSocketUpdate);
    };
  }, []);

  // Helper functions
  const getCoords = async (location) => {
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`,
      {
        withCredentials: false,
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    if (res.data.length === 0) throw new Error('Location not found');
    return {
      lat: parseFloat(res.data[0].lat),
      lon: parseFloat(res.data[0].lon)
    };
  };

  const haversine = (coord1, coord2) => {
    const R = 6371;
    const dLat = toRad(coord2.lat - coord1.lat);
    const dLon = toRad(coord2.lon - coord1.lon);
    const lat1 = toRad(coord1.lat);
    const lat2 = toRad(coord2.lat);
    const a = Math.sin(dLat/2) ** 2 + Math.sin(dLon/2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (deg) => deg * Math.PI / 180;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');
    try {
      const from = localStorage.getItem('hospitalId');
      // Debug logs for hospital list and user-selected location
      console.log("Hospital List:", hospitalList);
      console.log("User-selected Location:", location);
      const toHospital = hospitalList.find(
        h => h.name === location
      );
      if (!toHospital) {
        setStatus('Hospital not found');
        return;
      }

      const newRequest = {
        id: Math.floor(Math.random() * 1000),
        bloodType,
        quantity,
        urgency,
        location: toHospital.name,
        from: from,
        to: toHospital.hospitalId
      };

      console.log("Sending request:", newRequest);

      try {
        const response = await axios.post('http://${process.env.REACT_APP_API_URL}/api/requests', newRequest);
        socket.emit('bloodRequest', response.data);
      } catch (err) {
        console.error("Failed to save new request:", err);
      }
      setStatus('Sent!');

      setTimeout(() => setStatus(''), 3000);

      setBloodType('A+');
      setQuantity(1);
      setUrgency('Medium');
      setLocation('');
    } catch (error) {
      console.error('Error sending request:', error);
      setStatus('Error sending request');
    }
  };

  // Handle request actions
  const handleRequestAction = async (id, action) => {
    try {
      await axios.put(`http://${process.env.REACT_APP_API_URL}/api/requests/${id}`, { status: action });

      if (action === 'Rejected') {
        setRequests(requests.map(req =>
          (req.id || req._id) === id ? { ...req, status: 'Rejected' } : req
        ));
        setTimeout(() => {
          setRequests(requests.filter(request => (request.id || request._id) !== id));
        }, 2000);
      } else {
        setRequests(requests.map(req =>
          (req.id || req._id) === id ? { ...req, status: action } : req
        ));
      }
    } catch (err) {
      console.error("Failed to update request status:", err);
    }
  };

  // Add activeTab state for tab switching
  const [activeTab, setActiveTab] = useState('incoming');

  return (
    <div className="app">
      <div className="dashboard-container">
        {/* Left Section - Send Request */}
        <div className="send-request-section">
          <div className="section-header">
            <h2>Send Blood Request</h2>
          </div>
          <form onSubmit={handleSubmit} className="request-form">
            <div className="form-group">
              <label>1. Blood Type:</label>
              <select 
                value={bloodType} 
                onChange={(e) => setBloodType(e.target.value)}
                className="blood-type-select"
              >
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>2. Quantity (units):</label>
              <input 
                type="number" 
                min="1" 
                max="100" 
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="quantity-input"
              />
            </div>
            <div className="form-group">
              <label>3. Urgency:</label>
              <div className="urgency-slider">
                <input 
                  type="range" 
                  min="0" 
                  max="2" 
                  value={urgency === 'Low' ? 0 : urgency === 'Medium' ? 1 : 2}
                  onChange={(e) => 
                    setUrgency(['Low', 'Medium', 'High'][parseInt(e.target.value)])
                  }
                  className="slider"
                  data-urgency={urgency.toLowerCase()}
                />
                <div className="slider-labels">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
                <div className={`urgency-indicator ${urgency.toLowerCase()}`}>
                  {urgency}
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>4. Location:</label>
              <select 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="location-input"
              >
                <option value="">-- Select Hospital --</option>
                {hospitalList.map(h => (
                  <option key={h.hospitalId} value={h.name}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="send-button">
              Send Request
            </button>
            {status && (
              <div className={`status-badge ${status === 'Sent!' ? 'success' : 'sending'}`}>
                {status}
              </div>
            )}
          </form>
        </div>
        {/* Right Section - Manage Requests */}
        <div className="manage-requests-section">
          <div className="section-header">
            <h2>Incoming & Managed Requests</h2>
          </div>
          <div className="requests-list">
            <div className="request-tabs">
              <button
                className={activeTab === 'incoming' ? 'active-tab' : ''}
                onClick={() => setActiveTab('incoming')}
              >
                Incoming Requests ({requests.filter(r => String(r.to) === String(localStorage.getItem('hospitalId'))).length})
              </button>
              <button
                className={activeTab === 'outgoing' ? 'active-tab' : ''}
                onClick={() => setActiveTab('outgoing')}
              >
                Outgoing Requests ({requests.filter(r => String(r.from) === String(localStorage.getItem('hospitalId'))).length})
              </button>
            </div>
            {activeTab === 'incoming' ? (
              requests.filter(r => String(r.to) === String(localStorage.getItem('hospitalId'))).length > 0 ? (
                requests.filter(r => String(r.to) === String(localStorage.getItem('hospitalId'))).map(request => (
                  <div key={request.id || request._id} className={`request-card ${request.urgency.toLowerCase()} ${request.status?.toLowerCase() || ''}`}>
                    <div className="card-header">
                      <div><strong>Request ID:</strong> {request.id || request._id}</div>
                      <div><strong>Units:</strong> {request.quantity} unit(s) of {request.bloodType}</div>
                      <div><strong>Urgency:</strong> {request.urgency}</div>
                    </div>
                    <div className="card-body">
                      <div className="timestamp">
                        <strong>Requested on:</strong> {request.createdAt ? new Date(request.createdAt).toLocaleString() : 'N/A'}
                      </div>
                      {/* Optionally, keep location or other details here if needed */}
                      {!request.status && (
                        <div className="action-buttons">
                          <button className="accept-button" onClick={() => handleRequestAction(request.id || request._id, 'Accepted')}>Accept</button>
                          <button className="reject-button" onClick={() => handleRequestAction(request.id || request._id, 'Rejected')}>Reject</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-requests">No incoming requests</div>
              )
            ) : (
              requests.filter(r => String(r.from) === String(localStorage.getItem('hospitalId'))).length > 0 ? (
                requests.filter(r => String(r.from) === String(localStorage.getItem('hospitalId'))).map(request => (
                  <div key={request.id || request._id} className={`request-card ${request.urgency.toLowerCase()} ${request.status?.toLowerCase() || ''}`}>
                    <div className="card-header">
                      <div><strong>Request ID:</strong> {request.id || request._id}</div>
                      <div><strong>Units:</strong> {request.quantity} unit(s) of {request.bloodType}</div>
                      <div><strong>Urgency:</strong> {request.urgency}</div>
                    </div>
                    <div className="card-body">
                      <div className="timestamp">
                        <strong>Requested on:</strong> {request.createdAt ? new Date(request.createdAt).toLocaleString() : 'N/A'}
                      </div>
                      {/* Optionally, keep location or other details here if needed */}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-requests">No outgoing requests</div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Request;
