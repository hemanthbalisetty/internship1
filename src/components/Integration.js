import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Integration() {
  const [systems, setSystems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSystem, setModalSystem] = useState(null);
  const [systemInventory, setSystemInventory] = useState([]);

  // Fetch systems
  useEffect(() => {
    const fetchSystems = async () => {
      try {
        const res = await axios.get('http://${process.env.REACT_APP_API_URL}/api/hospitals');
        const hospitals = res.data.map(h => {
          const lowUnits = h.bloodInventory?.filter(unit => unit.quantity < 10).map(u => u.type);
          const status = lowUnits?.length
            ? `⚠️ Low: ${lowUnits.join(', ')}`
            : '✔️ Healthy';
          const color = lowUnits?.length ? '#FFCDD2' : '#C8E6C9';
          return {
            ...h,
            status,
            color,
            lastSync: h.lastSync ? new Date(h.lastSync).toLocaleString() : 'N/A',
          };
        });
        setSystems(hospitals);
      } catch (error) {
        console.error('❌ Error fetching hospital systems:', error);
      }
    };
    fetchSystems();
  }, []);


  const handleAction = async (action, id) => {
    try {
      const endpoint =
        action === 'Sync Now'
          ? `http://${process.env.REACT_APP_API_URL}/api/integration/sync/${id}`
          : `http://${process.env.REACT_APP_API_URL}/api/integration/retry/${id}`;
      const syncRes = await axios.post(endpoint);
      const updatedSystem = syncRes.data;

      setSystems(prev =>
        prev.map(sys =>
          sys.hospitalId === id
            ? {
                ...sys,
                lastSync: updatedSystem.lastSync
                  ? new Date(updatedSystem.lastSync).toLocaleString() 
                  : 'Just now',
                status: sys.status,
                color: sys.color,
              }
            : sys
        )
      );
    } catch (err) {
      console.error(`❌ Error performing ${action}:`, err);
    }
  };

  const handleDownloadSystemLogs = (system) => {
    const text = system.logs?.join('\n') || 'No logs available';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${system.name.replace(/\s+/g, '_').toLowerCase()}-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!systems.length) return;
    const headers = ['System Name', 'Status', 'Last Sync'];
    const rows = systems.map(sys => [sys.name, sys.status, sys.lastSync]);

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = 'integration-systems.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInventoryModal = async (system) => {
    try {
      const res = await axios.get(`http://${process.env.REACT_APP_API_URL}/api/blood-inventory/${system.hospitalId}`);
      setSystemInventory(res.data);
      setModalSystem(system.name);
      setModalVisible(true);
    } catch (err) {
      console.error('❌ Error fetching inventory for system:', err);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setModalSystem(null);
    setSystemInventory([]);
  };

  return (
    <div>
      

      <main style={styles.main}>
        <h2 style={styles.heading}>Connected Systems</h2>
        <button style={styles.exportCSVButton} onClick={handleExportCSV}>
          📊 Export System Data (CSV)
        </button>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.cell}>System Name</th>
                <th style={styles.cell}>Location</th>
                <th style={styles.cell}>Email</th>
                <th style={styles.cell}>Status</th>
                <th style={styles.cell}>Last Sync</th>
                <th style={styles.cell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {systems.map((sys) => (
                <tr key={sys._id}>
                  <td style={styles.cell}>{sys.name}</td>
                  <td style={styles.cell}>{sys.location}</td>
                  <td style={styles.cell}>{sys.email}</td>
                  <td style={{ ...styles.cell, backgroundColor: sys.color || '#eee' }}>
                    {sys.status}
                  </td>
                  <td style={styles.cell}>{sys.lastSync}</td>
                  <td style={styles.cell}>
                    <button
                      style={{ ...styles.actionButton, backgroundColor: '#2E7D32' }}
                      onClick={() => handleAction('Sync Now', sys.hospitalId)}
                    >
                      Sync Now
                    </button>
                    <button
                      style={{ ...styles.actionButton, backgroundColor: '#0288D1' }}
                      onClick={() => handleDownloadSystemLogs(sys)}
                    >
                      📄 Export Logs
                    </button>
                    <button
                      style={{ ...styles.actionButton,backgroundColor: '#ffffff',
                          color: '#C62828',
                          border: '2px solid #C62828',
                          fontWeight: '700' }}
                      onClick={() => handleOpenInventoryModal(sys)}
                    >
                      🩸 View Inventory
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        {/* Modal for View Inventory */}
        {modalVisible && (
  <div style={styles.fullModalOverlay}>
    <div style={styles.fullModal}>
      <button style={styles.closeModalX} onClick={handleCloseModal}>✖</button>
      <h2 style={{ color: '#C62828', marginBottom: '16px' }}>🩸 Inventory of {modalSystem}</h2>
      {systemInventory?.bloodInventory?.length ? (
        <table style={styles.modalTable}>
          <thead>
            <tr>
              <th style={styles.cell}>Blood Type</th>
              <th style={styles.cell}>Quantity (ml)</th>
            </tr>
          </thead>
          <tbody>
            {systemInventory.bloodInventory.map((item, index) => (
              <tr key={index}>
                <td style={styles.cell}>{item.type}</td>
                <td style={styles.cell}>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: '#888' }}>No inventory found for this organization.</p>
      )}
    </div>
  </div>
)}
      </main>


    </div>
  );
}

const styles = {
  header: {
    backgroundColor: '#C62828',
    height: '80px',
    padding: '16px',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  backButton: {
    backgroundColor: 'white',
    color: '#C62828',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
  },

  main: {
    backgroundColor: '#ffffff',
    padding: '16px',
  },

  heading: {
    color: '#C62828',
    marginTop: '32px',
  },

  exportCSVButton: {
    backgroundColor: '#C62828',
    color: '#fff',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    marginBottom: '16px',
    boxShadow: '0 4px 10px rgba(198, 40, 40, 0.3)',
    transition: 'all 0.3s ease',
  },

  tableContainer: {
    overflowY: 'auto',
    maxHeight: '400px',
    border: '1px solid #999',
    marginBottom: '20px',
    borderRadius: '8px',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },

  tableHeaderRow: {
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #999',
  },

  cell: {
    padding: '10px',
    textAlign: 'left',
    fontSize: '14px',
  },

  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginRight: '8px',
    marginTop: '4px',
    color: 'white',
    border: 'none',
    borderRadius: '999px',
    padding: '8px 14px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
    transition: 'all 0.2s ease-in-out',
  },

  fullModalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },

  fullModal: {
    width: '70%',
    maxHeight: '80vh',
    overflowY: 'auto',
    backgroundColor: '#fff',
    padding: '24px 32px',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
    position: 'relative',
  },

  closeModalX: {
    position: 'absolute',
    top: '16px',
    right: '20px',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    color: '#C62828',
    cursor: 'pointer',
  },

  modalTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
  },

  closeButton: {
    marginTop: '16px',
    backgroundColor: '#C62828',
    color: 'white',
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },

  footer: {
    backgroundColor: '#C62828',
    color: 'white',
    height: '60px',
    padding: '16px',
    textAlign: 'center',
    fontSize: '14px',
  },
};
export default Integration;