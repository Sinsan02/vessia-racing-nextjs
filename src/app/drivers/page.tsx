'use client';

import { useState, useEffect } from 'react';

const getPlaceholderImage = (name: string) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  return `data:image/svg+xml;base64,${btoa(
    `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="${colors[colorIndex]}"/>
      <text x="100" y="120" font-family="Arial, sans-serif" font-size="80" font-weight="bold" 
            text-anchor="middle" fill="white">
        ${name.charAt(0).toUpperCase()}
      </text>
    </svg>`
  )}`;
};

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers');
      const data = await response.json();
      if (data.drivers) {
        setDrivers(data.drivers);
      }
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#0a0a0a', paddingTop: '100px'}}>
      <main style={{padding: '20px'}}>
        <div className="container">
          {/* Header */}
          <div className="drivers-header" style={{textAlign: 'center', marginBottom: '30px'}}>
            <h1 style={{color: '#3EA822', fontSize: '2.5rem', marginBottom: '1rem'}}>
              ⚡ Our Drivers
            </h1>
            <p style={{color: '#ccc', fontSize: '1.1rem', marginTop: '15px'}}>
              Meet the professional drivers of Vessia Racing Team
            </p>
          </div>

          {/* Drivers List */}
          <div className="drivers-list" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {loading ? (
              <div style={{textAlign: 'center', color: '#888', padding: '40px', gridColumn: '1 / -1'}}>
                <div style={{fontSize: '2rem', marginBottom: '15px'}}>⚡</div>
                <p>Loading drivers...</p>
              </div>
            ) : drivers.length === 0 ? (
              <div style={{textAlign: 'center', color: '#888', padding: '40px', gridColumn: '1 / -1'}}>
                <p>No drivers registered yet.</p>
              </div>
            ) : (
              drivers.map((driver: any) => (
                <div 
                  key={driver.id} 
                  className="driver-card"
                  style={{
                    backgroundColor: '#1a1a1a',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #333',
                    textAlign: 'center'
                  }}
                >
                  <div style={{marginBottom: '15px'}}>
                    {driver.profile_picture ? (
                      <img
                        src={driver.profile_picture}
                        alt={`${driver.fullName || driver.name || 'Driver'} profile`}
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          margin: '0 auto',
                          display: 'block',
                          border: '3px solid #3EA822'
                        }}
                      />
                    ) : (
                      <img
                        src={getPlaceholderImage(driver.fullName || driver.name || 'Driver')}
                        alt={`${driver.fullName || driver.name || 'Driver'} placeholder`}
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          margin: '0 auto',
                          display: 'block',
                          border: '3px solid #3EA822'
                        }}
                      />
                    )}
                  </div>
                  <h3 style={{color: '#3EA822', marginBottom: '10px'}}>
                    {driver.fullName || driver.name || 'Unknown Driver'}
                  </h3>
                  <p style={{color: '#888', fontSize: '0.9rem', marginBottom: '8px'}}>
                    Experience: {driver.experience || 'Not specified'}
                  </p>
                  {driver.email && (
                    <p style={{color: '#666', fontSize: '0.8rem'}}>
                      {driver.email}
                    </p>
                  )}
                  {driver.registrationDate && (
                    <p style={{color: '#666', fontSize: '0.8rem', marginTop: '8px'}}>
                      Joined: {new Date(driver.registrationDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}