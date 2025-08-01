import React, { useState, useEffect } from 'react';
import './dashboard.css';
import { useNavigate } from 'react-router-dom';
import Request from './Request';
import Integration from './Integration';
import Registry from './OrganRegistry';
import MatchPage from './MatchPage';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('donors');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [bloodInventory, setBloodInventory] = useState([]);
  const [editableInventory, setEditableInventory] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [hospitalName, setHospitalName] = useState('Hospital Dashboard');
  // const [organs, setOrgans] = useState({ donors: [], recipients: [] });
  const [organs] = useState({
  donors: [
    { organType: 'Kidney', _id: 'D001', location: 'City Hospital', status: 'Available', availability: 'Immediate' },
    { organType: 'Heart', _id: 'D002', location: 'Metro Care', status: 'Stable', availability: '2 Hours' },
    { organType: 'Liver', _id: 'D003', location: 'Sunrise Hospital', status: 'High', availability: 'Immediate' },
    { organType: 'Lung', _id: 'D004', location: 'City Hospital', status: 'Available', availability: 'Low Urgency' },
    { organType: 'Pancreas', _id: 'D005', location: 'Hope Center', status: 'Stable', availability: 'Medium Urgency' }
  ],
  recipients: [
    { organType: 'Heart', _id: 'R001', location: 'Greenview Clinic', status: 'High Urgency', availability: 'Immediate' },
    { organType: 'Kidney', _id: 'R002', location: 'Saint Mary Hospital', status: 'Needed', availability: '2 Hours' },
    { organType: 'Liver', _id: 'R003', location: 'Metro Care', status: 'Low', availability: 'Medium Urgency' },
    { organType: 'Lung', _id: 'R004', location: 'City Hospital', status: 'High Urgency', availability: 'Immediate' },
    { organType: 'Pancreas', _id: 'R005', location: 'Hope Center', status: 'Needed', availability: 'High Urgency' }
  ]
});
  // const [notifications, setNotifications] = useState([]);
  

  const navigate = useNavigate();
  // Ensure hospitalId is the custom hospital ID (e.g., "HOS003"), not the MongoDB ObjectId
  const hospitalId = localStorage.getItem('hospitalId');
  if (!hospitalId) {
    console.error('Hospital ID missing in localStorage');
  }

  const ALL_BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  useEffect(() => {
    const timer = setInterval(() => setLastUpdated(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch hospital name
  useEffect(() => {
    if (!hospitalId) return;
    // The endpoint below expects the hospitalId to be the custom hospital code (e.g., "HOS003")
    fetch(`http://${process.env.REACT_APP_API_URL}/api/organisation/hospital-id/${hospitalId}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data?.name) {
          setHospitalName(data.name);
        } else {
          console.warn('Hospital name not found in response:', data);
        }
      })
      .catch(err => console.error('Error fetching hospital name:', err));
  }, [hospitalId]);

  // Fetch blood inventory
  useEffect(() => {
    if (!hospitalId) return;
    fetch(`http://${process.env.REACT_APP_API_URL}/api/blood-inventory/${hospitalId}`)
      .then(res => res.json())
      .then(data => {
        const bloodData = data.bloodInventory || [];
        const inventoryMap = {};
        bloodData.forEach(item => {
          const group = item.bloodGroup || item.type;
          if (group && typeof item.quantity === 'number') {
            inventoryMap[group] = {
              bloodGroup: group,
              quantity: item.quantity,
              status: item.status || 'Needed'
            };
          }
        });

        const completeInventory = ALL_BLOOD_TYPES.map(type => ({
          bloodGroup: type,
          quantity: inventoryMap[type]?.quantity || 0,
          status: inventoryMap[type]?.status || 'Needed',
        }));

        setBloodInventory(completeInventory);


        const newEditableInventory = {};
        ALL_BLOOD_TYPES.forEach(type => {
          newEditableInventory[type] = inventoryMap[type]?.quantity || 0;
        });
        setEditableInventory(newEditableInventory);
      });
  }, [hospitalId]);

  const handleEditClick = () => setIsEditing(true);
  const handleCancelEdit = () => setIsEditing(false);

  const handleQuantityChange = (bloodGroup, value) => {
    setEditableInventory(prev => ({
      ...prev,
      [bloodGroup]: Math.max(0, parseInt(value) || 0)
    }));
  };

 
const handleSaveChanges = async () => {
  if (!hospitalId) {
    console.error('Hospital ID not found in localStorage');
    return;
  }
    console.log("➡️ Saving units to backend:", editableInventory);
  try {
    // Ensure all 8 blood types are always updated/created
    await fetch(`http://${process.env.REACT_APP_API_URL}/api/blood-inventory/update-units/${hospitalId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updatedUnits: editableInventory })
    });

    // After update, fetch the inventory again to ensure all 8 types are present
    fetch(`http://${process.env.REACT_APP_API_URL}/api/blood-inventory/${hospitalId}`)
      .then(res => res.json())
      .then(data => {
        console.log("Fetched blood data:", data);
        const inventoryMap = {};
        // Use a flexible approach for API response structure
        const inventoryArray = Array.isArray(data) ? data : data.bloodInventory;
        if (!Array.isArray(inventoryArray)) {
          console.error('Expected array in response:', data);
          return;
        }

        inventoryArray.forEach(item => {
          inventoryMap[item.type || item.bloodGroup] = item;
        });

        const completeInventory = ALL_BLOOD_TYPES.map(type => ({
          bloodGroup: type,
          quantity: parseInt(inventoryMap[type]?.quantity || 0),
          status: inventoryMap[type]?.status || 'Needed',
        }));

        setBloodInventory(completeInventory);

        const updatedEditable = {};
        ALL_BLOOD_TYPES.forEach(type => {
          updatedEditable[type] = parseInt(inventoryMap[type]?.quantity || 0);
        });
        setEditableInventory(updatedEditable);
      })
      .catch(err => {
        console.error('Failed to fetch updated inventory:', err);
      })
      .finally(() => {
        setIsEditing(false);
      });
  } catch (err) {
    console.error('Failed to save inventory:', err);
    setIsEditing(false);
  }
};

  const getStatusColor = (status) => {
    switch (status) {
      case 'Stable':
      case 'Available':
      case 'High':
      case 'Immediate':
        return 'status-green';
      case 'Low':
      case 'Medium Urgency':
      case '2 Hours':
        return 'status-yellow';
      case 'Needed':
      case 'High Urgency':
        return 'status-red';
      case 'Pending':
      case 'Low Urgency':
        return 'status-gray';
      default:
        return '';
    }
  };

  const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date) => date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Internal dashboard section tabs state
  const [activeDashboardSection, setActiveDashboardSection] = useState('blood');

  // Render subsection: Blood Supply
  const renderBloodSupplySection = () => (
    <section className="dashboard-column blood-supply">
      <div className="column-header">
        <h2><i className="fas fa-tint"></i> Blood Supply Status</h2>
        <div className="last-updated"><i className="fas fa-clock"></i> {formatTime(lastUpdated)}</div>
      </div>

      <div className="blood-card-grid">
        {bloodInventory.map((blood, index) => (
          <div key={index} className={`blood-card ${getStatusColor(blood.status)}`}>
            <div className="blood-icon"><i className="fas fa-tint"></i></div>
            <div className="blood-info">
              <h3>{blood.bloodGroup}</h3>
              <p>Status: {blood.status}</p>
              {isEditing ? (
                <input
                  type="number"
                  value={editableInventory[blood.bloodGroup] || 0}
                  min="0"
                  onChange={(e) => handleQuantityChange(blood.bloodGroup, e.target.value)}
                />
              ) : (
                <p>{blood.quantity} units</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="edit-controls">
        {isEditing ? (
          <>
            <button className="save-button" onClick={handleSaveChanges}>Save Changes</button>
            <button className="cancel-button" onClick={handleCancelEdit}>Cancel</button>
          </>
        ) : (
          <button className="edit-button" onClick={handleEditClick}>Edit Units</button>
        )}
      </div>
    </section>
  );

  // Render subsection: Organ Donation
  const renderOrganDonationSection = () => (
    <section className="dashboard-column organ-donation">
      <div className="column-header">
        <h2><i className="fas fa-heartbeat"></i> Organ Donation Status</h2>
        <div className="last-updated"><i className="fas fa-clock"></i> {formatTime(lastUpdated)}</div>
      </div>

      <div className="organ-tabs">
        <button className={activeTab === 'donors' ? 'active' : ''} onClick={() => setActiveTab('donors')}>Donors</button>
        <button className={activeTab === 'recipients' ? 'active' : ''} onClick={() => setActiveTab('recipients')}>Recipients</button>
      </div>

      <div className="organ-table-container">
        <table className="organ-table">
          <thead>
            <tr>
              <th>Organ</th>
              <th>ID</th>
              <th>Location</th>
              <th>Status</th>
              <th>Urgency</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {organs[activeTab].map((item, i) => (
              <tr key={i}>
                <td>{item.organType}</td>
                <td>{item._id}</td>
                <td>{item.location}</td>
                <td className={getStatusColor(item.status)}>{item.status}</td>
                <td className={getStatusColor(item.availability)}>{item.availability}</td>
                <td><button className="match-button">Match Now</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  // Render subsection: Notifications
  // const renderNotificationsSection = () => (
  //   <section className="dashboard-column notifications">
  //     <div className="column-header">
  //       <h2><i className="fas fa-bell"></i> Notifications</h2>
  //       <div className="last-updated"><i className="fas fa-clock"></i> {formatTime(lastUpdated)}</div>
  //     </div>
  //     <div className="notification-list">
  //       {notifications.map((note, i) => (
  //         <div key={i} className={`notification-item ${note.urgent ? 'urgent' : ''}`}>
  //           <p>{note.text}</p>
  //           <span className="notification-time">{formatTime(lastUpdated)}</span>
  //         </div>
  //       ))}
  //     </div>
  //   </section>
  // );

  // Unified dashboard with internal tabs/toggles
  const renderDashboard = () => (
    <main className="dashboard-main full-screen">
      <div className="dashboard-content">
        {activeDashboardSection === 'blood' && renderBloodSupplySection()}
        {activeDashboardSection === 'organ' && renderOrganDonationSection()}
        {/* {activeDashboardSection === 'notifications' && renderNotificationsSection()} */}
      </div>
    </main>
  );

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>{hospitalName}</h1>
        </div>
        <button className="mobile-menu-button" onClick={toggleMenu}>
          <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
        <nav className={`header-nav ${isMenuOpen ? 'open' : ''}`}>
          <ul>
            <li className={activeMenu === 'dashboard' ? 'active' : ''}><a href="#" onClick={() => handleMenuClick('dashboard')}><i className="fas fa-tachometer-alt"></i> Dashboard</a></li>
            <li className={activeMenu === 'blood' ? 'active' : ''}><a href="#" onClick={() => handleMenuClick('blood')}><i className="fas fa-tint"></i> Requests</a></li>
            <li className={activeMenu === 'organ' ? 'active' : ''}><a href="#" onClick={() => handleMenuClick('organ')}><i className="fas fa-heartbeat"></i> Organ Registry</a></li>
            <li className={activeMenu === 'matches' ? 'active' : ''}><a href="#" onClick={() => handleMenuClick('matches')}><i className="fas fa-handshake"></i> Matches</a></li>
            <li className={activeMenu === 'reports' ? 'active' : ''}><a href="#" onClick={() => handleMenuClick('reports')}><i className="fas fa-chart-bar"></i> Integration</a></li>
            <li className="dropdown">
              <a href="#"><i className="fas fa-user-circle"></i> Account</a>
              <ul className="dropdown-menu">
                <li><a href="#">Help</a></li>
                <li><a href="#">Contact Support</a></li>
                <li><a href="#" onClick={handleLogout}>Logout</a></li>
              </ul>
            </li>
          </ul>
        </nav>
      </header>


      {activeMenu === 'dashboard' && (
        <>
          <div className="dashboard-tabs">
            <button className={activeDashboardSection === 'blood' ? 'active' : ''} onClick={() => setActiveDashboardSection('blood')}>Blood Supply</button>
            <button className={activeDashboardSection === 'organ' ? 'active' : ''} onClick={() => setActiveDashboardSection('organ')}>Organ Donation</button>
            {/* <button className={activeDashboardSection === 'notifications' ? 'active' : ''} onClick={() => setActiveDashboardSection('notifications')}>Notifications</button> */}
          </div>
          {renderDashboard()}
        </>
      )}
      {activeMenu === 'blood' && <Request />}
      {activeMenu === 'organ' && <Registry />}
      {activeMenu === 'matches' && <MatchPage />}
      {activeMenu === 'reports' && <Integration />}

    </div>
  );
}

export default Dashboard;