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

  useEffect(() => {
    fetchLeagues();
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
    <div className="min-h-screen" style={{backgroundColor: '#0a0a0a', paddingTop: '100px'}}>
      <main style={{padding: '20px'}}>
        <div className="container">
          {/* Header */}
          <div className="results-header" style={{textAlign: 'center', marginBottom: '30px'}}>
            <h1 style={{color: '#3EA822', fontSize: '2.5rem', marginBottom: '1rem'}}>
              🏆 Championship Results
            </h1>
            <p style={{color: '#ccc', fontSize: '1.1rem', marginTop: '15px'}}>
              View championship standings and driver performances
            </p>
          </div>

          {/* League Selector */}
          <div className="league-selector" style={{marginBottom: '30px', textAlign: 'center'}}>
            <label style={{color: '#3EA822', fontSize: '1.2rem', marginRight: '15px'}}>
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
                  padding: '10px 15px',
                  fontSize: '1rem',
                  minWidth: '200px',
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
            <div className="results-table-container">
              <h2 style={{color: '#3EA822', fontSize: '1.5rem', marginBottom: '20px', textAlign: 'center'}}>
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
                <div className="standings-table" style={{overflowX: 'auto'}}>
                  <table style={{
                    width: '100%',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid #333'
                  }}>
                    <thead>
                      <tr style={{backgroundColor: '#333'}}>
                        <th style={{color: '#3EA822', padding: '15px', textAlign: 'left'}}>Position</th>
                        <th style={{color: '#3EA822', padding: '15px', textAlign: 'left'}}>Driver</th>
                        <th style={{color: '#3EA822', padding: '15px', textAlign: 'center'}}>Points</th>
                        <th style={{color: '#3EA822', padding: '15px', textAlign: 'center'}}>Races</th>
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
                          <td style={{padding: '15px'}}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: '1.2rem',
                              fontWeight: 'bold',
                              color: getRankColor(index + 1)
                            }}>
                              #{index + 1}
                              {index === 0 && <span style={{marginLeft: '8px'}}>🥇</span>}
                              {index === 1 && <span style={{marginLeft: '8px'}}>🥈</span>}
                              {index === 2 && <span style={{marginLeft: '8px'}}>🥉</span>}
                            </div>
                          </td>
                          <td style={{padding: '15px'}}>
                            <div style={{display: 'flex', alignItems: 'center'}}>
                              {driver.profile_picture && driver.profile_picture.trim() !== '' ? (
                                <img
                                  src={driver.profile_picture}
                                  alt={`${driver.full_name} profile`}
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    marginRight: '12px',
                                    border: '2px solid #3EA822'
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
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  backgroundColor: getPlaceholderColor(driver.full_name),
                                  display: (!driver.profile_picture || driver.profile_picture.trim() === '') ? 'flex' : 'none',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginRight: '12px',
                                  fontSize: '1.2rem',
                                  fontWeight: 'bold',
                                  color: 'white',
                                  border: '2px solid #3EA822',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                }}
                              >
                                {driver.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{color: '#fff', fontWeight: '500', fontSize: '1rem'}}>
                                  {driver.full_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{padding: '15px', textAlign: 'center'}}>
                            <div style={{
                              color: '#3EA822',
                              fontSize: '1.3rem',
                              fontWeight: 'bold'
                            }}>
                              {driver.points}
                            </div>
                          </td>
                          <td style={{padding: '15px', textAlign: 'center'}}>
                            <div style={{color: '#888', fontSize: '1rem'}}>
                              {driver.races_completed}
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