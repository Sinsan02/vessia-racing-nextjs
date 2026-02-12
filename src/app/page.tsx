'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [latestEvent, setLatestEvent] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const hasFetchedData = useRef(false);

  
  useEffect(() => {
    // Prevent double mounting in StrictMode
    if (hasFetchedData.current) return;
    hasFetchedData.current = true;
    
    // Check for welcome message from URL params
    const params = new URLSearchParams(window.location.search);
    const message = params.get('message');
    if (message) {
      setWelcomeMessage(message);
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Check if we just logged in (from login redirect) and force refresh if needed
    const justLoggedIn = params.get('login');
    if (justLoggedIn === 'success') {
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      // Force a reload to ensure auth state is updated
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }

    // Fetch user status, upcoming event and achievements
    fetchUser();
    fetchLatestEvent();
    fetchAchievements();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      const data = await response.json();
      console.log('User data from API:', data);
      if (data && data.id) {
        setUser(data);
        console.log('User is logged in:', data);
      } else {
        console.log('No user logged in');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchLatestEvent = async () => {
    try {
      const response = await fetch('/api/events/latest');
      const data = await response.json();
      if (data.success && data.event) {
        setLatestEvent(data.event);
      }
    } catch (error) {
      console.error('Failed to fetch upcoming event:', error);
    }
  };

  const fetchAchievements = async () => {
    try {
      setAchievementsLoading(true);
      const response = await fetch('/api/achievements/homepage');
      const data = await response.json();
      if (data.success && data.achievements) {
        setAchievements(data.achievements);
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setAchievementsLoading(false);
    }
  };

  return (
    <div style={{
      backgroundImage: `url('/images/decorative/Screenshot_2025-11-23_180245.png')`,
      backgroundColor: '#0a0a0a',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
      width: '100%',
      position: 'relative'
    }}>
      {/* Welcome Message */}
      {welcomeMessage && (
        <div style={{
          backgroundColor: '#28a745', 
          color: 'white', 
          padding: '15px', 
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          {welcomeMessage}
        </div>
      )}

      {/* Hero Section */}
      <section className="hero" style={{
        background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7))'
      }}>
        <div className="hero-content">
          <Image 
            src="/Vessia_Logo.png" 
            alt="Vessia Racing" 
            width={400} 
            height={400} 
            style={{maxWidth: '400px', height: 'auto', marginBottom: '20px'}}
            priority
          />
          <p className="hero-subtitle">Norwegian sim racing team</p>
          <p className="hero-description">Competing in Scandinavian leagues and special events with dedication, precision and teamwork</p>
          <div className="hero-buttons">
            <Link href="#achievements" className="btn-primary racing-pulse">Our Accomplishments</Link>
            {!user && <Link href="/register" className="btn-secondary">Sign Up</Link>}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" className="section" style={{
        backgroundImage: `linear-gradient(rgba(10,10,10,0.7), rgba(10,10,10,0.8)), url('/images/decorative/Screenshot_2025-10-11_170801.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        position: 'relative'
      }}>
        <div className="container">
          <h2 className="section-title">🏆 Our Accomplishments</h2>
          <p className="section-subtitle">Celebrating our victories on the world's most challenging circuits</p>
          
          {achievementsLoading ? (
            <div className="achievements-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '25px',
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-card"></div>
              ))}
            </div>
          ) : achievements.length > 0 ? (
            <div className="achievements-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '25px',
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0',
              width: '100%',
              boxSizing: 'border-box'
            }}>              {achievements.map((achievement, index) => (
                <div key={achievement.id} className="achievement-card" style={{
                  backgroundColor: '#1a1a1a',
                  borderRadius: '15px',
                  padding: '25px',
                  border: '2px solid #3EA822',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  animationDelay: `${index * 0.1}s`,
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}>
                  {/* Achievement Icon/Badge */}
                  <div style={{
                    fontSize: '3rem',
                    marginBottom: '15px',
                    background: 'linear-gradient(135deg, #3EA822, #2d7a19)',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 15px',
                    boxShadow: '0 5px 15px rgba(62, 168, 34, 0.3)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                  className="achievement-icon"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.2) rotateY(180deg)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(62, 168, 34, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1) rotateY(0deg)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(62, 168, 34, 0.3)';
                  }}>
                    {achievement.icon}
                  </div>

                  {/* Position Badge */}
                  {achievement.position <= 3 && (
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      right: '15px',
                      backgroundColor: achievement.position === 1 ? '#FFD700' : achievement.position === 2 ? '#C0C0C0' : '#CD7F32',
                      color: '#000',
                      padding: '5px 10px',
                      borderRadius: '15px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {achievement.position === 1 ? '1st' : achievement.position === 2 ? '2nd' : '3rd'} Place
                    </div>
                  )}

                  <h3 style={{
                    color: '#3EA822',
                    fontSize: '1.4rem',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                    lineHeight: '1.3',
                    wordWrap: 'break-word'
                  }}>
                    {achievement.title}
                  </h3>

                  <p style={{
                    color: '#ccc',
                    fontSize: '1rem',
                    marginBottom: '10px',
                    fontWeight: '500'
                  }}>
                    🏁 {achievement.race_name}
                  </p>

                  {achievement.track_name && (
                    <p style={{
                      color: '#888',
                      fontSize: '0.9rem',
                      marginBottom: '10px'
                    }}>
                      📍 {achievement.track_name}
                    </p>
                  )}

                  <p style={{
                    color: '#888',
                    fontSize: '0.9rem',
                    marginBottom: '15px'
                  }}>
                    📅 {new Date(achievement.achievement_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>

                  {achievement.description && (
                    <div style={{
                      color: '#999',
                      fontSize: '0.85rem',
                      lineHeight: '1.6',
                      marginTop: '15px',
                      textAlign: 'center'
                    }}>
                      {achievement.description.split(', ').filter((d: string) => d.trim()).map((driver: string, idx: number) => (
                        <div key={idx} style={{marginBottom: '4px'}}>
                          🏎️ {driver}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Category Badge */}
                  <div style={{
                    position: 'absolute',
                    bottom: '15px',
                    left: '15px',
                    backgroundColor: 'rgba(62, 168, 34, 0.2)',
                    color: '#3EA822',
                    padding: '4px 8px',
                    borderRadius: '10px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    border: '1px solid #3EA822'
                  }}>
                    {achievement.category}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              color: '#888',
              padding: '60px 20px'
            }}>
              <div style={{fontSize: '4rem', marginBottom: '20px'}}>🏆</div>
              <h3 style={{color: '#ccc', marginBottom: '10px'}}>No accomplishments yet</h3>
              <p>Our victories will be showcased here as we compete and win!</p>
            </div>
          )}

          {/* View All Button */}
          {achievements.length > 0 && (
            <div style={{
              textAlign: 'center',
              marginTop: '40px'
            }}>
              <Link
                href="/achievements"
                className="btn-primary"
                style={{
                  backgroundColor: '#3EA822',
                  color: 'white',
                  padding: '12px 30px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                View All Accomplishments
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Event Section */}
      <section id="results" className="section section-dark" style={{
        backgroundImage: `linear-gradient(rgba(10,10,10,0.7), rgba(10,10,10,0.8)), url('/images/decorative/Screenshot_2025-11-15_150823.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        position: 'relative'
      }}>
        <div className="container">
          <h2 className="section-title">Upcoming Event</h2>
          {latestEvent ? (
            <div className="latest-event" style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '15px',
              padding: '25px',
              border: '1px solid #333',
              textAlign: 'center',
              maxWidth: '800px',
              margin: '0 auto',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {latestEvent.image_url && (
                <div style={{
                  position: 'relative',
                  height: '200px',
                  width: '100%',
                  marginBottom: '20px',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  <Image
                    src={latestEvent.image_url}
                    alt={latestEvent.name}
                    fill
                    style={{objectFit: 'contain', backgroundColor: '#222'}}
                    onError={(e) => {
                      console.error('Homepage image load failed for:', latestEvent.name, latestEvent.image_url);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('Homepage image loaded successfully for:', latestEvent.name, latestEvent.image_url);
                    }}
                  />
                </div>
              )}
              <h3 style={{
                color: '#3EA822',
                fontSize: '1.8rem',
                marginBottom: '10px'
              }}>
                🏁 {latestEvent.name}
              </h3>
              <p style={{
                color: '#ccc',
                fontSize: '1.1rem',
                marginBottom: '8px'
              }}>
                📅 {new Date(latestEvent.event_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                {latestEvent.event_time && ` at ${latestEvent.event_time.substring(0, 5)}`}
              </p>
              {latestEvent.track_name && (
                <p style={{
                  color: '#ccc',
                  fontSize: '1rem',
                  marginBottom: '15px'
                }}>
                  🏁 {latestEvent.track_name}
                </p>
              )}
              {latestEvent.description && (
                <p style={{
                  color: '#888',
                  fontSize: '0.95rem',
                  marginBottom: '20px',
                  maxWidth: '600px',
                  margin: '0 auto 20px'
                }}>
                  {latestEvent.description}
                </p>
              )}
              <div style={{marginTop: '20px'}}>
                <Link
                  href="/events"
                  className="btn-primary"
                  style={{
                    backgroundColor: '#3EA822',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    display: 'inline-block',
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  View All Events
                </Link>
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              color: '#888',
              padding: '40px'
            }}>
              <div style={{fontSize: '3rem', marginBottom: '15px'}}>🏁</div>
              <p>No events have been completed yet.</p>
              <Link
                href="/events"
                className="btn-primary"
                style={{
                  backgroundColor: '#3EA822',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  marginTop: '15px'
                }}
              >
                View Events
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Join Our Team Section */}
      <section className="section" style={{
        backgroundImage: `linear-gradient(rgba(10,10,10,0.7), rgba(10,10,10,0.8)), url('/images/decorative/Screenshot_2025-05-18_205724.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        position: 'relative'
      }}>
        <div className="container">
          <div style={{
            textAlign: 'center',
            padding: '50px 20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '15px',
            border: '2px solid #3EA822',
            maxWidth: '800px',
            margin: '0 auto',
            boxSizing: 'border-box',
            width: '100%'
          }}>
            <div style={{fontSize: '2.5rem', marginBottom: '15px'}}>🚀</div>
            <h3 style={{color: '#3EA822', marginBottom: '10px', fontSize: '2rem', fontWeight: 'bold'}}>
              Want to join our winning team?
            </h3>
            <p style={{color: '#888', marginBottom: '25px', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 25px'}}>
              Be part of our racing success story and compete at the highest level in professional sim racing
            </p>
            <a
              href="https://www.instagram.com/vessiaracing/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{
                backgroundColor: '#3EA822',
                color: 'white',
                padding: '15px 35px',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              Contact us here
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
