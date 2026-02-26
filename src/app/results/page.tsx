'use client';

import { useState, useEffect } from 'react';

interface League {
  id: number;
  name: string;
  description?: string;
}

interface DriverPoint {
  id: number;
  full_name: string;
  profile_picture?: string;
  points: number;
  races_completed: number;
}

const getPlaceholderColor = (name: string) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  return colors[name.charCodeAt(0) % colors.length];
};

export default function Results() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [points, setPoints] = useState<DriverPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    fetchLeagues();
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      fetchPoints(selectedLeague);
    }
  }, [selectedLeague]);

  const fetchLeagues = async () => {
    try {
      const response = await fetch('/api/leagues');
      const data = await response.json();
      if (data.success && data.leagues) {
        setLeagues(data.leagues);
        // Auto-select first league if available
        if (data.leagues.length > 0) {
          setSelectedLeague(data.leagues[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPoints = async (leagueId: number) => {
    setPointsLoading(true);
    try {
      const response = await fetch(`/api/leagues/${leagueId}/points`);
      const data = await response.json();
      if (data.success && data.points) {
        setPoints(data.points);
      }
    } catch (error) {
      console.error('Failed to fetch points:', error);
    } finally {
      setPointsLoading(false);
    }
  };

  const getRankColor = (position: number) => {
    switch (position) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return '#3EA822'; // Green
    }
  };

  return (
    <div className="min-h-screen" style={{
      paddingTop: '100px',
      paddingBottom: '40px',
      backgroundImage: `linear-gradient(rgba(10,10,10,${isMobile ? '0.75' : '0.9'}), rgba(10,10,10,${isMobile ? '0.75' : '0.9'})), url('/images/decorative/Screenshot_2025-11-10_214034.png')`,
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
      <main style={{padding: '0'}}>
        <div className="container" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '20px 15px' : '40px 20px',
          boxSizing: 'border-box',
          width: '100%'
        }}>
          {/* Header */}
          <div className="results-header" style={{textAlign: 'center', marginBottom: '30px', padding: '0'}}>
            <h1 style={{color: '#3EA822', fontSize: isMobile ? '2rem' : '2.5rem', marginBottom: '1rem'}}>
              🏆 Championship Results
            </h1>
            <p style={{color: '#ccc', fontSize: isMobile ? '1rem' : '1.1rem', marginTop: '15px'}}>
              View championship standings and driver performances
            </p>
          </div>

          {/* League Selector */}
          <div className="league-selector" style={{marginBottom: '30px', textAlign: 'center', padding: '0'}}>
            <label style={{color: '#3EA822', fontSize: isMobile ? '1rem' : '1.2rem', marginRight: '15px', display: isMobile ? 'block' : 'inline', marginBottom: isMobile ? '10px' : '0'}}>
              Select League:
            </label>
            {loading ? (
              <div style={{color: '#888'}}>Loading leagues...</div>
            ) : (
              <select
                value={selectedLeague || ''}
                onChange={(e) => setSelectedLeague(Number(e.target.value))}
                style={{
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  border: '2px solid #3EA822',
                  borderRadius: '8px',
                  padding: isMobile ? '8px 12px' : '10px 15px',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  minWidth: isMobile ? '180px' : '200px',
                  maxWidth: isMobile ? 'calc(100% - 20px)' : 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">Choose a league...</option>
                {leagues.map((league) => (
                  <option key={league.id} value={league.id}>
                    {league.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Results Table */}
          {selectedLeague ? (
            <div className="results-table-container" style={{
              maxWidth: isMobile ? '100%' : '900px',
              margin: '0 auto',
              padding: '0',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <h2 style={{color: '#3EA822', fontSize: isMobile ? '1.3rem' : '1.5rem', marginBottom: '20px', textAlign: 'center', padding: '0', width: '100%'}}>
                Standings - {leagues.find(l => l.id === selectedLeague)?.name}
              </h2>
              
              {pointsLoading ? (
                <div style={{textAlign: 'center', color: '#888', padding: '40px'}}>
                  <div style={{fontSize: '2rem', marginBottom: '15px'}}>🏁</div>
                  <p>Loading standings...</p>
                </div>
              ) : points.length === 0 ? (
                <div style={{textAlign: 'center', color: '#888', padding: '40px'}}>
                  <p>No results available for this league yet.</p>
                </div>
              ) : (
                <div className="standings-table" style={{width: '100%'}}>
                  <table style={{
                    width: '100%',
                    backgroundColor: isMobile ? 'transparent' : '#1a1a1a',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: isMobile ? '1px solid rgba(62, 168, 34, 0.3)' : '1px solid #333',
                    tableLayout: isMobile ? 'auto' : 'fixed',
                    margin: '0 auto'
                  }}>
                    <thead>
                      <tr style={{backgroundColor: '#333'}}>
                        <th style={{color: '#3EA822', padding: isMobile ? '12px 8px' : '15px', textAlign: 'left', width: isMobile ? '60px' : 'auto'}}>Position</th>
                        <th style={{color: '#3EA822', padding: isMobile ? '12px 8px' : '15px', textAlign: 'left'}}>Driver</th>
                        <th style={{color: '#3EA822', padding: isMobile ? '12px 8px' : '15px', textAlign: 'center', width: isMobile ? '70px' : 'auto'}}>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {points.map((driver, index) => (
                        <tr 
                          key={driver.id}
                          style={{
                            borderBottom: index < points.length - 1 ? '1px solid #333' : 'none',
                            backgroundColor: index % 2 === 0 ? '#1a1a1a' : '#222'
                          }}
                        >
                          <td style={{padding: isMobile ? '12px 8px' : '15px'}}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: isMobile ? '1rem' : '1.2rem',
                              fontWeight: 'bold',
                              color: getRankColor(index + 1)
                            }}>
                              #{index + 1}
                              {index === 0 && <span style={{marginLeft: '8px'}}>🥇</span>}
                              {index === 1 && <span style={{marginLeft: '8px'}}>🥈</span>}
                              {index === 2 && <span style={{marginLeft: '8px'}}>🥉</span>}
                            </div>
                          </td>
                          <td style={{padding: isMobile ? '12px 8px' : '15px'}}>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                              {driver.profile_picture && driver.profile_picture.trim() !== '' ? (
                                <img
                                  src={driver.profile_picture}
                                  alt={`${driver.full_name} profile`}
                                  style={{
                                    width: isMobile ? '35px' : '40px',
                                    height: isMobile ? '35px' : '40px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    marginRight: isMobile ? '8px' : '12px',
                                    border: '2px solid #3EA822',
                                    flexShrink: 0
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
                                  width: isMobile ? '35px' : '40px',
                                  height: isMobile ? '35px' : '40px',
                                  borderRadius: '50%',
                                  backgroundColor: getPlaceholderColor(driver.full_name),
                                  display: (!driver.profile_picture || driver.profile_picture.trim() === '') ? 'flex' : 'none',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginRight: isMobile ? '8px' : '12px',
                                  fontSize: isMobile ? '1rem' : '1.2rem',
                                  fontWeight: 'bold',
                                  color: 'white',
                                  border: '2px solid #3EA822',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                  flexShrink: 0
                                }}
                              >
                                {driver.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div style={{flex: 1, minWidth: 0}}>
                                <div style={{color: '#fff', fontWeight: '500', fontSize: isMobile ? '0.9rem' : '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                  {driver.full_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{padding: isMobile ? '12px 8px' : '15px', textAlign: 'center'}}>
                            <div style={{
                              color: '#3EA822',
                              fontSize: isMobile ? '1.1rem' : '1.3rem',
                              fontWeight: 'bold'
                            }}>
                              {driver.points}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              color: '#888',
              padding: '40px',
              backgroundColor: '#1a1a1a',
              borderRadius: '10px',
              border: '1px solid #333'
            }}>
              <div style={{fontSize: '2rem', marginBottom: '15px'}}>🏁</div>
              <p>Please select a league to view championship standings.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}