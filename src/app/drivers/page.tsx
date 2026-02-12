'use client';

import { useState, useEffect } from 'react';

const getPlaceholderColor = (name: string) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  return colors[name.charCodeAt(0) % colors.length];
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
    <div className="min-h-screen" style={{
      paddingTop: '100px',
      backgroundImage: `linear-gradient(rgba(10,10,10,0.9), rgba(10,10,10,0.9)), url('/images/decorative/Screenshot_2026-01-23_201045.png')`,
      backgroundColor: '#0a0a0a',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'scroll',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
      position: 'relative'
    }}>
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
                    {driver.profile_picture && driver.profile_picture.trim() !== '' ? (
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
                        onError={(e) => {
                          // Replace with placeholder if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const placeholder = target.nextElementSibling as HTMLElement;
                          if (placeholder) {
                            placeholder.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: getPlaceholderColor(driver.fullName || driver.name || 'Driver'),
                        display: (!driver.profile_picture || driver.profile_picture.trim() === '') ? 'flex' : 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        color: 'white',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        border: '3px solid #3EA822',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                      }}
                    >
                      {(driver.fullName || driver.name || 'D').charAt(0).toUpperCase()}
                    </div>
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