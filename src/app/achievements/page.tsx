'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Achievements() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      const data = await response.json();
      if (data.success) {
        setAchievements(data.achievements);
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column'
      }}>
        <div style={{fontSize: '3rem', marginBottom: '20px'}}>🏆</div>
        <p style={{color: '#888'}}>Loading achievements...</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundImage: `linear-gradient(rgba(10,10,10,0.75), rgba(10,10,10,0.75)), url('/images/decorative/Screenshot_2025-10-11_170713.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      width: '100%'
    }}>
      <div className="container" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
        paddingTop: '120px'
      }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '50px'
      }}>
        <h1 style={{
          color: '#3EA822',
          fontSize: '3rem',
          marginBottom: '15px',
          fontWeight: 'bold'
        }}>
          🏆 Our Achievements
        </h1>
        <p style={{
          color: '#888',
          fontSize: '1.2rem',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          A showcase of our victories and accomplishments on racing circuits around the world
        </p>
      </div>

      {/* Achievements Grid */}
      {achievements.length === 0 ? (
        <div style={{
          textAlign: 'center',
          color: '#888',
          padding: '80px 20px',
          backgroundColor: '#1a1a1a',
          borderRadius: '15px'
        }}>
          <div style={{fontSize: '5rem', marginBottom: '25px'}}>🏆</div>
          <h2 style={{color: '#ccc', marginBottom: '15px', fontSize: '1.8rem'}}>No achievements yet</h2>
          <p style={{fontSize: '1.1rem', marginBottom: '30px'}}>Our victories will be showcased here as we compete and win!</p>
          <Link
            href="/"
            className="btn-primary"
            style={{
              backgroundColor: '#3EA822',
              color: 'white',
              padding: '12px 30px',
              borderRadius: '8px',
              textDecoration: 'none',
              display: 'inline-block',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            Return to Home
          </Link>
        </div>
      ) : (
        <>
          {/* Achievement Count */}
          <div style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <h2 style={{
              color: '#3EA822',
              fontSize: '1.5rem',
              marginBottom: '10px'
            }}>
              
            </h2>
            <div style={{
              width: '100px',
              height: '3px',
              backgroundColor: '#3EA822',
              margin: '0 auto',
              borderRadius: '2px'
            }} />
          </div>

          {/* Achievements Grid */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '25px',
            maxWidth: '800px',
            margin: '0 auto',
            marginBottom: '50px'
          }}>
            {achievements.map((achievement, index) => (
              <div key={achievement.id} style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '20px',
                padding: '30px',
                border: '2px solid #3EA822',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(62, 168, 34, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                {/* Achievement Number */}
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  left: '15px',
                  backgroundColor: 'rgba(62, 168, 34, 0.2)',
                  color: '#3EA822',
                  padding: '6px 12px',
                  borderRadius: '15px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  border: '1px solid #3EA822'
                }}>
                  #{index + 1}
                </div>

                {/* Position Badge */}
                {achievement.position <= 3 && (
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    backgroundColor: achievement.position === 1 ? '#FFD700' : achievement.position === 2 ? '#C0C0C0' : '#CD7F32',
                    color: '#000',
                    padding: '6px 12px',
                    borderRadius: '15px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}>
                    {achievement.position === 1 ? '🥇 1st' : achievement.position === 2 ? '🥈 2nd' : '🥉 3rd'} Place
                  </div>
                )}

                {/* Achievement Icon */}
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '20px',
                  background: 'linear-gradient(135deg, #3EA822, #2d7a19)',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 8px 25px rgba(62, 168, 34, 0.4)',
                  border: '3px solid rgba(62, 168, 34, 0.3)'
                }}>
                  {achievement.icon}
                </div>

                <h3 style={{
                  color: '#3EA822',
                  fontSize: '1.6rem',
                  marginBottom: '12px',
                  fontWeight: 'bold',
                  lineHeight: '1.3'
                }}>
                  {achievement.title}
                </h3>

                <p style={{
                  color: '#ccc',
                  fontSize: '1.1rem',
                  marginBottom: '12px',
                  fontWeight: '600'
                }}>
                  🏁 {achievement.race_name}
                </p>

                {achievement.track_name && (
                  <p style={{
                    color: '#888',
                    fontSize: '1rem',
                    marginBottom: '12px'
                  }}>
                    📍 {achievement.track_name}
                  </p>
                )}

                <p style={{
                  color: '#888',
                  fontSize: '0.95rem',
                  marginBottom: '18px',
                  fontWeight: '500'
                }}>
                  📅 {new Date(achievement.achievement_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>

                {achievement.description && (
                  <p style={{
                    color: '#999',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    marginBottom: '20px',
                    fontStyle: 'italic'
                  }}>
                    "{achievement.description}"
                  </p>
                )}

                {/* Category Badge */}
                <div style={{
                  display: 'inline-block',
                  backgroundColor: 'rgba(62, 168, 34, 0.15)',
                  color: '#3EA822',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  border: '2px solid rgba(62, 168, 34, 0.3)',
                  marginTop: '10px'
                }}>
                  {achievement.category}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      </div>
    </div>
  );
}