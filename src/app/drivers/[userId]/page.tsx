'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

interface DriverProfile {
  id: number;
  full_name: string;
  email: string;
  experience_level: string;
  bio?: string;
  profile_picture?: string;
  created_at: string;
  iracing_customer_id?: string;
  iracing_data?: {
    irating?: number;
    safety_rating?: string;
    license_class?: string;
    license_level?: number;
    last_updated?: string;
  };
}

const getPlaceholderColor = (name: string) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  return colors[name.charCodeAt(0) % colors.length];
};

export default function DriverProfile() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId as string;
  
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const [refreshingStats, setRefreshingStats] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    if (userId) {
      fetchDriverProfile();
      checkAdmin();
    }
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [userId]);

  const checkAdmin = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      setIsAdmin(data?.role === "admin");
    } catch {
      setIsAdmin(false);
    }
  };

  const fetchDriverProfile = async () => {
    try {
      const response = await fetch(`/api/drivers/${userId}`);
      if (!response.ok) {
        throw new Error('Driver not found');
      }
      const data = await response.json();
      setDriver(data.driver);
    } catch (err: any) {
      setError(err.message || 'Failed to load driver profile');
    } finally {
      setLoading(false);
    }
  };

  const refreshIRacingStats = async () => {
    if (!driver?.iracing_customer_id || refreshingStats) return;
    
    setRefreshingStats(true);
    try {
      const response = await fetch(`/api/drivers/${userId}/iracing-stats`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        await fetchDriverProfile(); // Refresh the entire profile
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to refresh stats');
      }
    } catch (err) {
      setError('Error refreshing iRacing stats');
    } finally {
      setRefreshingStats(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
        color: '#fff',
        paddingTop: '100px'
      }}>
        <div style={{ fontSize: '1.5rem' }}>Loading...</div>
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
        color: '#fff',
        paddingTop: '100px',
        gap: '20px'
      }}>
        <div style={{ fontSize: '1.5rem', color: '#f44' }}>{error || 'Driver not found'}</div>
        <button
          onClick={() => router.push('/drivers')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3EA822',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Back to Drivers
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      height: 'auto',
      paddingTop: isMobile ? '80px' : '120px',
      paddingBottom: '60px',
      backgroundImage: `linear-gradient(rgba(10,10,10,${isMobile ? '0.85' : '0.9'}), rgba(10,10,10,${isMobile ? '0.85' : '0.9'})), url('/images/decorative/Screenshot_2026-01-23_201045.png')`,
      backgroundColor: '#0a0a0a',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'scroll',
      color: '#fff',
      overflowY: 'auto',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: isMobile ? '0 16px' : '0 32px'
      }}>
        {/* Back Button */}
        <button
          onClick={() => router.push('/drivers')}
          style={{
            marginBottom: '20px',
            padding: '8px 16px',
            backgroundColor: 'rgba(62, 168, 34, 0.2)',
            color: '#3EA822',
            border: '1px solid #3EA822',
            borderRadius: '6px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#3EA822';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(62, 168, 34, 0.2)';
            e.currentTarget.style.color = '#3EA822';
          }}
        >
          ← Back to Drivers
        </button>

        {/* Profile Header */}
        <div style={{
          backgroundColor: 'rgba(26, 26, 26, 0.95)',
          borderRadius: '12px',
          padding: isMobile ? '24px' : '40px',
          marginBottom: '24px',
          border: '2px solid #3EA822'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'center' : 'flex-start',
            gap: '24px'
          }}>
            {/* Profile Picture */}
            <div style={{
              position: 'relative',
              width: isMobile ? '120px' : '150px',
              height: isMobile ? '120px' : '150px',
              flexShrink: 0
            }}>
              {driver.profile_picture ? (
                <Image
                  src={driver.profile_picture}
                  alt={driver.full_name}
                  fill
                  style={{
                    objectFit: 'cover',
                    borderRadius: '50%',
                    border: '3px solid #3EA822'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundColor: getPlaceholderColor(driver.full_name),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? '3rem' : '4rem',
                  fontWeight: 'bold',
                  color: '#fff',
                  border: '3px solid #3EA822'
                }}>
                  {driver.full_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Driver Info */}
            <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
              <h1 style={{
                fontSize: isMobile ? '1.8rem' : '2.5rem',
                marginBottom: '12px',
                color: '#3EA822',
                fontWeight: 'bold'
              }}>
                {driver.full_name}
              </h1>
              
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '16px',
                marginBottom: '16px',
                fontSize: '1rem',
                color: '#aaa',
                justifyContent: isMobile ? 'center' : 'flex-start'
              }}>
                <div>
                  <strong style={{ color: '#3EA822' }}>Experience:</strong>{' '}
                  <span style={{ textTransform: 'capitalize' }}>{driver.experience_level}</span>
                </div>
                <div>
                  <strong style={{ color: '#3EA822' }}>Member since:</strong>{' '}
                  {new Date(driver.created_at).toLocaleDateString()}
                </div>
              </div>

              {driver.bio && (
                <p style={{
                  fontSize: '1rem',
                  color: '#ccc',
                  lineHeight: '1.6',
                  marginTop: '16px'
                }}>
                  {driver.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* iRacing Stats */}
        {driver.iracing_customer_id ? (
          <div style={{
            backgroundColor: 'rgba(26, 26, 26, 0.95)',
            borderRadius: '12px',
            padding: isMobile ? '24px' : '32px',
            marginBottom: '24px',
            border: '2px solid #3EA822'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <h2 style={{
                fontSize: isMobile ? '1.5rem' : '2rem',
                color: '#3EA822',
                fontWeight: 'bold',
                margin: 0
              }}>
                iRacing Statistics
              </h2>
              
              {isAdmin && (
                <button
                  onClick={refreshIRacingStats}
                  disabled={refreshingStats}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: refreshingStats ? '#555' : '#3EA822',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    cursor: refreshingStats ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => !refreshingStats && (e.currentTarget.style.backgroundColor = '#4db82e')}
                  onMouseLeave={(e) => !refreshingStats && (e.currentTarget.style.backgroundColor = '#3EA822')}
                >
                  {refreshingStats ? '⟳ Refreshing...' : '⟳ Refresh Stats'}
                </button>
              )}
            </div>

            {driver.iracing_data ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                {driver.iracing_data.irating && (
                  <div style={{
                    backgroundColor: 'rgba(62, 168, 34, 0.1)',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #3EA822',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '8px' }}>
                      iRating
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3EA822' }}>
                      {driver.iracing_data.irating}
                    </div>
                  </div>
                )}

                {driver.iracing_data.safety_rating && (
                  <div style={{
                    backgroundColor: 'rgba(62, 168, 34, 0.1)',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #3EA822',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '8px' }}>
                      Safety Rating
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3EA822' }}>
                      {driver.iracing_data.safety_rating}
                    </div>
                  </div>
                )}

                {driver.iracing_data.license_class && (
                  <div style={{
                    backgroundColor: 'rgba(62, 168, 34, 0.1)',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid #3EA822',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '8px' }}>
                      License
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3EA822' }}>
                      {driver.iracing_data.license_class}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#888',
                fontSize: '1.1rem'
              }}>
                No iRacing stats available yet
                {isAdmin && (
                  <div style={{ marginTop: '12px', fontSize: '0.9rem' }}>
                    Click "Refresh Stats" to fetch data from iRacing
                  </div>
                )}
              </div>
            )}

            {driver.iracing_data?.last_updated && (
              <div style={{
                marginTop: '20px',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: '#666'
              }}>
                Last updated: {new Date(driver.iracing_data.last_updated).toLocaleString()}
              </div>
            )}
          </div>
        ) : (
          isAdmin && (
            <div style={{
              backgroundColor: 'rgba(26, 26, 26, 0.95)',
              borderRadius: '12px',
              padding: isMobile ? '24px' : '32px',
              marginBottom: '24px',
              border: '2px solid #f44',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.2rem', color: '#f44', marginBottom: '8px' }}>
                No iRacing Customer ID configured
              </div>
              <div style={{ fontSize: '0.9rem', color: '#888' }}>
                Add an iRacing Customer ID to this user's profile to display stats
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
