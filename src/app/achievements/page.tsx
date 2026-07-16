'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faFlagCheckered, faLocationDot, faCalendar, faCar, faMedal, faCrown, faBolt } from '@fortawesome/free-solid-svg-icons';

const ACHIEVEMENT_ICON_MAP: Record<string, any> = {
  trophy: faTrophy, 'medal-gold': faMedal, 'medal-silver': faMedal,
  'medal-bronze': faMedal, crown: faCrown, 'flag-checkered': faFlagCheckered,
  bolt: faBolt, fire: faBolt,
  '🏆': faTrophy, '🥇': faMedal, '🥈': faMedal, '🥉': faMedal,
  '👑': faCrown, '🏁': faFlagCheckered, '⚡': faBolt, '🔥': faBolt,
};
const ACHIEVEMENT_ICON_COLOR: Record<string, string> = {
  'medal-gold': '#FFD700', 'medal-silver': '#C0C0C0', 'medal-bronze': '#CD7F32',
  '🥇': '#FFD700', '🥈': '#C0C0C0', '🥉': '#CD7F32',
};
function AchievementIcon({ icon }: { icon: string }) {
  const fa = ACHIEVEMENT_ICON_MAP[icon] || faTrophy;
  const color = ACHIEVEMENT_ICON_COLOR[icon];
  return <FontAwesomeIcon icon={fa} style={color ? { color } : undefined} />;
}

export default function Achievements() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    fetchAchievements();
    return () => window.removeEventListener('resize', checkScreenSize);
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
        <div style={{fontSize: '3rem', marginBottom: '20px'}}><FontAwesomeIcon icon={faTrophy} /></div>
        <p style={{color: '#888'}}>Loading accomplishments...</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundImage: `linear-gradient(rgba(10,10,10,${isMobile ? '0.65' : '0.75'}), rgba(10,10,10,${isMobile ? '0.65' : '0.75'})), url('/images/decorative/Screenshot_2025-10-11_170713.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'scroll',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
      width: '100%',
      paddingTop: isMobile ? '0' : '40px',
      paddingBottom: isMobile ? '20px' : '40px',
      position: 'relative',
      transform: isMobile ? 'translate3d(0,0,0)' : undefined
    }}>
      <div className="container" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: isMobile ? '20px 15px' : '40px 20px',
        paddingTop: isMobile ? '20px' : '120px',
        boxSizing: 'border-box',
        width: '100%'
      }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '50px',
        padding: isMobile ? '0 10px' : '0'
      }}>
        <h1 style={{
          color: '#3EA822',
          fontSize: isMobile ? '1.8rem' : '3rem',
          marginBottom: '15px',
          fontWeight: 'bold'
        }}>
          Our Accomplishments
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
          padding: isMobile ? '40px 20px' : '80px 20px',
          backgroundColor: isMobile ? 'rgba(26, 26, 26, 0.85)' : '#1a1a1a',
          borderRadius: '15px',
          border: '1px solid rgba(62, 168, 34, 0.3)',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{fontSize: '5rem', marginBottom: '25px'}}><FontAwesomeIcon icon={faTrophy} /></div>
          <h2 style={{color: '#ccc', marginBottom: '15px', fontSize: '1.8rem'}}>No accomplishments yet</h2>
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
            gap: isMobile ? '20px' : '25px',
            maxWidth: '800px',
            margin: '0 auto',
            marginBottom: '50px',
            width: '100%',
            padding: isMobile ? '0 10px' : '0',
            boxSizing: 'border-box'
          }}>
            {achievements.map((achievement, index) => (
              <div key={achievement.id} style={{
                backgroundColor: isMobile ? 'rgba(26, 26, 26, 0.85)' : '#1a1a1a',
                borderRadius: isMobile ? '15px' : '20px',
                padding: isMobile ? '20px 15px' : '30px',
                border: '2px solid #3EA822',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'default',
                maxWidth: '100%',
                boxSizing: 'border-box'
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
                    <FontAwesomeIcon icon={faMedal} style={{color: achievement.position === 1 ? '#FFD700' : achievement.position === 2 ? '#C0C0C0' : '#CD7F32', marginRight: '4px'}} />
                    {achievement.position === 1 ? '1st' : achievement.position === 2 ? '2nd' : '3rd'} Place
                  </div>
                )}

                {/* Achievement Icon */}
                <div style={{
                  fontSize: isMobile ? '3rem' : '4rem',
                  marginBottom: '20px',
                  background: 'linear-gradient(135deg, #3EA822, #2d7a19)',
                  width: isMobile ? '80px' : '100px',
                  height: isMobile ? '80px' : '100px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 8px 25px rgba(62, 168, 34, 0.4)',
                  border: '3px solid rgba(62, 168, 34, 0.3)'
                }}>
                  <AchievementIcon icon={achievement.icon} />
                </div>

                <h3 style={{
                  color: '#3EA822',
                  fontSize: isMobile ? '1.3rem' : '1.6rem',
                  marginBottom: '12px',
                  fontWeight: 'bold',
                  lineHeight: '1.3',
                  wordWrap: 'break-word'
                }}>
                  {achievement.title}
                </h3>

                <p style={{
                  color: '#ccc',
                  fontSize: '1.1rem',
                  marginBottom: '12px',
                  fontWeight: '600'
                }}>
                  <FontAwesomeIcon icon={faFlagCheckered} /> {achievement.race_name}
                </p>

                {achievement.track_name && (
                  <p style={{
                    color: '#888',
                    fontSize: '1rem',
                    marginBottom: '12px'
                  }}>
                    <FontAwesomeIcon icon={faLocationDot} /> {achievement.track_name}
                  </p>
                )}

                <p style={{
                  color: '#888',
                  fontSize: '0.95rem',
                  marginBottom: '18px',
                  fontWeight: '500'
                }}>
                  <FontAwesomeIcon icon={faCalendar} /> {new Date(achievement.achievement_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>

                {achievement.description && (
                  <div style={{
                    color: '#999',
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    marginBottom: '20px',
                    textAlign: 'center'
                  }}>
                    {achievement.description.split(', ').filter((d: string) => d.trim()).map((driver: string, idx: number) => (
                      <div key={idx} style={{marginBottom: '5px'}}>
                        <FontAwesomeIcon icon={faCar} /> {driver}
                      </div>
                    ))}
                  </div>
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