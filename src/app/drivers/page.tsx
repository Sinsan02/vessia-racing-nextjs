'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const getPlaceholderColor = (name: string) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  return colors[name.charCodeAt(0) % colors.length];
};

export default function Drivers() {
  const router = useRouter();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    fetchDrivers();
    checkAdmin();
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const checkAdmin = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      setIsAdmin(data?.role === "admin");
    } catch {
      setIsAdmin(false);
    }
  };

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

  const handleReorder = async (driverId: number, direction: 'up' | 'down') => {
    try {
      const res = await fetch('/api/drivers/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ driverId, direction })
      });
      
      if (res.ok) {
        fetchDrivers(); // Refresh list
      } else {
        const data = await res.json();
        console.error('Failed to reorder:', data.error);
      }
    } catch (error) {
      console.error('Error reordering drivers:', error);
    }
  };

  return (
    <div className="min-h-screen" style={{
      paddingTop: '100px',
      paddingBottom: '40px',
      backgroundImage: `linear-gradient(rgba(10,10,10,${isMobile ? '0.75' : '0.9'}), rgba(10,10,10,${isMobile ? '0.75' : '0.9'})), url('/images/decorative/Screenshot_2026-01-23_201045.png')`,
      backgroundColor: '#0a0a0a',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'scroll',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
      height: 'auto',
      position: 'relative',
      overflowY: 'scroll',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      touchAction: 'pan-y pan-x'
    }}>
      <main style={{padding: isMobile ? '20px 15px' : '20px'}}>
        <div className="container" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '20px 15px' : '40px 20px',
          boxSizing: 'border-box',
          width: '100%'
        }}>
          {/* Header */}
          <div className="drivers-header" style={{textAlign: 'center', marginBottom: '30px', padding: isMobile ? '0 10px' : '0'}}>
            <h1 style={{color: '#3EA822', fontSize: isMobile ? '2rem' : '2.5rem', marginBottom: '1rem'}}>
              Our Drivers
            </h1>
            <p style={{color: '#ccc', fontSize: isMobile ? '0.95rem' : '1.1rem', marginTop: '15px'}}>
              Meet the professional drivers of Vessia Racing Team
            </p>
          </div>

          {isAdmin && (
            <div style={{ textAlign: "center", marginBottom: isMobile ? "16px" : "24px" }}>
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                style={{
                  padding: isMobile ? "10px 24px" : "12px 32px",
                  backgroundColor: isEditMode ? "#c00" : "#3EA822",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: isMobile ? "0.9rem" : "1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.backgroundColor = isEditMode ? "#f44" : "#4db82e";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.backgroundColor = isEditMode ? "#c00" : "#3EA822";
                }}
              >
                {isEditMode ? "✕ Lukk redigering" : "✏️ Endre rekkefølge"}
              </button>
            </div>
          )}

          {/* Drivers List */}
          <div className="drivers-list" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxWidth: '800px',
            margin: '0 auto',
            padding: isMobile ? '0 10px' : '0',
            boxSizing: 'border-box'
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
              drivers.map((driver: any, index: number) => (
                <div 
                  key={driver.id} 
                  className="driver-card"
                  onClick={() => !isEditMode && router.push(`/drivers/${driver.id}`)}
                  style={{
                    backgroundColor: '#1a1a1a',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px solid #333',
                    textAlign: 'center',
                    position: 'relative',
                    cursor: isEditMode ? 'default' : 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isEditMode) {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.borderColor = '#3EA822';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(62, 168, 34, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isEditMode) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#333';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {isAdmin && isEditMode && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px'
                    }}>
                      <button
                        onClick={() => handleReorder(driver.id, 'up')}
                        disabled={index === 0}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: index === 0 ? '#555' : '#3EA822',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: 'bold'
                        }}
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleReorder(driver.id, 'down')}
                        disabled={index === drivers.length - 1}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: index === drivers.length - 1 ? '#555' : '#3EA822',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: index === drivers.length - 1 ? 'not-allowed' : 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: 'bold'
                        }}
                      >
                        ▼
                      </button>
                    </div>
                  )}
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