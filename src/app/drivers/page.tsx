'use client';

import { useState, useEffect } from 'react';

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

          {/* Drivers Grid */}
          <div className="drivers-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'}}>
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
                      <div 
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #3EA822 0%, #2d7a1a 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          fontSize: '2rem',
                          fontWeight: 'bold',
                          color: 'white',
                          boxShadow: '0 4px 20px rgba(62, 168, 34, 0.3)'
                        }}
                      >
                        {driver.fullName || driver.name ? (driver.fullName || driver.name).charAt(0).toUpperCase() : 'D'}
                      </div>
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