'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faFlagCheckered, faLocationDot, faCalendar, faCar, faRocket, faMedal, faCrown, faBolt } from '@fortawesome/free-solid-svg-icons';

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

export default function Home() {
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [latestEvent, setLatestEvent] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const hasFetchedData = useRef(false);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const achievementsBgRef = useRef<HTMLDivElement>(null);
  const eventBgRef = useRef<HTMLDivElement>(null);
  const joinBgRef = useRef<HTMLDivElement>(null);

  // Scroll-driven parallax for the decorative section backgrounds (desktop and mobile alike).
  // Uses transforms on an oversized absolutely-positioned layer instead of
  // `background-attachment: fixed`, which previously caused crashes on iPhone.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const bgRefs = [heroBgRef, achievementsBgRef, eventBgRef, joinBgRef];
    const speed = 0.15;
    const maxOffset = 150;
    let ticking = false;

    const updateParallax = () => {
      bgRefs.forEach((ref) => {
        const el = ref.current;
        const parent = el?.parentElement;
        if (!el || !parent) return;
        const rect = parent.getBoundingClientRect();
        const offset = Math.max(-maxOffset, Math.min(maxOffset, rect.top * speed));
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    // This app scrolls inside <body> (globals.css gives html/body their own
    // overflow-y: auto), not the window — so the scroll event fires on body
    // and does not bubble. Listen on body directly; keep window as a
    // harmless fallback in case that layout ever changes.
    updateParallax();
    document.body.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      document.body.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);


  useEffect(() => {
    // Mark component as mounted to prevent hydration issues
    setIsMounted(true);
    
    // Prevent double mounting in StrictMode
    if (hasFetchedData.current) return;
    hasFetchedData.current = true;
    
    // Check screen size for mobile background
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
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
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [isMobile]);

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

  const backgrounds = [
    '/images/decorative/Screenshot_2025-11-23_180245.png',
    '/images/decorative/Screenshot_2025-10-11_170801.png',
    '/images/decorative/Screenshot_2025-11-15_150823.png',
    '/images/decorative/Screenshot_2025-05-18_205724.png'
  ];

  return (
    <div style={{
      backgroundColor: '#0a0a0a',
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
        backgroundColor: '#0a0a0a',
        paddingBottom: '5px',
        paddingTop: '5px',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div ref={heroBgRef} style={{position: 'absolute', top: '-20%', left: 0, right: 0, height: '140%', willChange: 'transform', zIndex: 0}}>
          <Image
            src="/images/decorative/Screenshot_2025-11-23_180245.png"
            alt=""
            fill
            sizes="100vw"
            quality={68}
            priority
            style={{objectFit: 'cover'}}
          />
        </div>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(rgba(10,10,10,0.35), rgba(10,10,10,0.55))',
          pointerEvents: 'none',
          zIndex: 1
        }} />
        <div className="hero-content" style={{position: 'relative', zIndex: 2}}>
          <Image 
            src="/Vessia_Logo.png" 
            alt="Vessia Racing" 
            width={isMobile ? 300 : 400} 
            height={isMobile ? 300 : 400} 
            style={{maxWidth: isMobile ? '80vw' : '400px', height: 'auto', marginBottom: isMobile ? '20px' : '20px'}}
            priority
          />
          <p className="hero-subtitle" style={{
            fontSize: isMobile ? '1.2rem' : undefined, 
            marginBottom: isMobile ? '10px' : undefined,
            textShadow: isMobile ? '0 0 8px rgba(0, 0, 0, 0.9), 0 0 12px rgba(0, 0, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.9)' : undefined
          }}>Norwegian sim racing team</p>
          <p className="hero-description" style={{
            fontSize: isMobile ? '1.3rem' : undefined, 
            marginBottom: isMobile ? '20px' : undefined, 
            padding: isMobile ? '0 10px' : undefined,
            textShadow: isMobile ? '0 0 8px rgba(0, 0, 0, 0.9), 0 0 12px rgba(0, 0, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.9)' : undefined
          }}>Competing in Scandinavian leagues and special events with dedication, precision and teamwork</p>
          <div className="hero-buttons" style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            width: '100%',
            margin: '0 auto'
          }}>
            <Link href="#achievements" className="btn-primary racing-pulse">Our Accomplishments</Link>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" className="section" style={{
        backgroundColor: '#0a0a0a',
        minHeight: '100vh',
        position: 'relative',
        paddingTop: '5px',
        paddingBottom: '5px',
        overflow: 'hidden'
      }}>
        <div ref={achievementsBgRef} style={{position: 'absolute', top: '-20%', left: 0, right: 0, height: '140%', willChange: 'transform', zIndex: 0}}>
          <Image
            src="/images/decorative/Screenshot_2025-10-11_170801.png"
            alt=""
            fill
            sizes="100vw"
            quality={65}
            style={{objectFit: 'cover'}}
          />
        </div>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(rgba(10,10,10,0.7), rgba(10,10,10,0.8))',
          pointerEvents: 'none',
          zIndex: 1
        }} />
        <div className="container" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '8px 10px' : '40px 20px',
          boxSizing: 'border-box',
          width: '100%',
          position: 'relative',
          zIndex: 2
        }}>
          <h2 className="section-title" style={{fontSize: isMobile ? '1.3rem' : undefined, marginBottom: isMobile ? '6px' : undefined}}>Our Accomplishments</h2>
          <p className="section-subtitle" style={{
            fontSize: isMobile ? '1.1rem' : undefined, 
            marginBottom: isMobile ? '10px' : undefined,
            textShadow: isMobile ? '0 0 8px rgba(0, 0, 0, 0.9), 0 0 12px rgba(0, 0, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.9)' : undefined
          }}>Celebrating our victories on the world's most challenging circuits</p>
          
          {achievementsLoading ? (
            <div className="achievements-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: isMobile ? '10px' : '25px',
              maxWidth: '1000px',
              margin: '0 auto',
              padding: isMobile ? '0 8px' : '0 20px',
              width: '100%',
              boxSizing: 'border-box',
              justifyItems: 'center'
            }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-card"></div>
              ))}
            </div>
          ) : achievements.length > 0 ? (
            <div className="achievements-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: isMobile ? '10px' : '25px',
              maxWidth: '1000px',
              margin: '0 auto',
              padding: isMobile ? '0 8px' : '0 20px',
              width: '100%',
              boxSizing: 'border-box',
              justifyItems: 'center'
            }}>              {achievements.map((achievement, index) => (
                <div key={achievement.id} className="achievement-card" style={{
                  backgroundColor: '#1a1a1a',
                  borderRadius: isMobile ? '10px' : '15px',
                  padding: isMobile ? '10px' : '25px',
                  paddingBottom: isMobile ? '12px' : '30px',
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
                    fontSize: isMobile ? '1.5rem' : '3rem',
                    marginBottom: isMobile ? '6px' : '15px',
                    background: 'linear-gradient(135deg, #3EA822, #2d7a19)',
                    width: isMobile ? '45px' : '80px',
                    height: isMobile ? '45px' : '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: isMobile ? '0 auto 6px' : '0 auto 15px',
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
                    <AchievementIcon icon={achievement.icon} />
                  </div>

                  {achievement.position <= 3 && (
                    <div style={{
                      position: 'absolute',
                      top: isMobile ? '6px' : '15px',
                      right: isMobile ? '6px' : '15px',
                      backgroundColor: achievement.position === 1 ? '#FFD700' : achievement.position === 2 ? '#C0C0C0' : '#CD7F32',
                      color: '#000',
                      padding: isMobile ? '2px 6px' : '5px 10px',
                      borderRadius: isMobile ? '8px' : '15px',
                      fontSize: isMobile ? '0.6rem' : '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {achievement.position === 1 ? '1st' : achievement.position === 2 ? '2nd' : '3rd'} Place
                    </div>
                  )}

                  <h3 style={{
                    color: '#3EA822',
                    fontSize: isMobile ? '0.95rem' : '1.4rem',
                    marginBottom: isMobile ? '4px' : '8px',
                    fontWeight: 'bold',
                    lineHeight: '1.3',
                    wordWrap: 'break-word'
                  }}>
                    {achievement.title}
                  </h3>

                  <p style={{
                    color: '#ccc',
                    fontSize: isMobile ? '0.75rem' : '1rem',
                    marginBottom: isMobile ? '4px' : '10px',
                    fontWeight: '500'
                  }}>
                    <FontAwesomeIcon icon={faFlagCheckered} /> {achievement.race_name}
                  </p>

                  {achievement.track_name && (
                    <p style={{
                      color: '#b0b0b0',
                      fontSize: isMobile ? '0.7rem' : '0.9rem',
                      marginBottom: isMobile ? '4px' : '10px'
                    }}>
                      <FontAwesomeIcon icon={faLocationDot} /> {achievement.track_name}
                    </p>
                  )}

                  <p style={{
                    color: '#b0b0b0',
                    fontSize: isMobile ? '0.65rem' : '0.9rem',
                    marginBottom: isMobile ? '6px' : '15px'
                  }}>
                    <FontAwesomeIcon icon={faCalendar} /> {new Date(achievement.achievement_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>

                  {achievement.description && (
                    <div style={{
                      color: '#c0c0c0',
                      fontSize: '0.85rem',
                      lineHeight: '1.6',
                      marginTop: '15px',
                      marginBottom: '20px',
                      textAlign: 'center'
                    }}>
                      {achievement.description.split(', ').filter((d: string) => d.trim()).map((driver: string, idx: number) => (
                        <div key={idx} style={{marginBottom: '4px'}}>
                          <FontAwesomeIcon icon={faCar} /> {driver}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Category Badge */}
                  <div style={{
                    backgroundColor: 'rgba(62, 168, 34, 0.2)',
                    color: '#3EA822',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    border: '1px solid #3EA822',
                    display: 'inline-block',
                    marginTop: '10px'
                  }}>
                    {achievement.category}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              color: '#b0b0b0',
              padding: '60px 20px'
            }}>
              <div style={{fontSize: '4rem', marginBottom: '20px'}}><FontAwesomeIcon icon={faTrophy} /></div>
              <h3 style={{color: '#ccc', marginBottom: '10px'}}>No accomplishments yet</h3>
              <p>Our victories will be showcased here as we compete and win!</p>
            </div>
          )}

          {/* View All Button */}
          {achievements.length > 0 && (
            <div style={{
              textAlign: 'center',
              marginTop: '40px',
              display: 'flex',
              justifyContent: 'center',
              width: '100%'
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
        backgroundColor: '#0a0a0a',
        minHeight: '100vh',
        position: 'relative',
        paddingTop: '5px',
        paddingBottom: '5px',
        overflow: 'hidden'
      }}>
        <div ref={eventBgRef} style={{position: 'absolute', top: '-20%', left: 0, right: 0, height: '140%', willChange: 'transform', zIndex: 0}}>
          <Image
            src="/images/decorative/Screenshot_2025-11-15_150823.png"
            alt=""
            fill
            sizes="100vw"
            quality={65}
            style={{objectFit: 'cover'}}
          />
        </div>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(rgba(10,10,10,0.7), rgba(10,10,10,0.8))',
          pointerEvents: 'none',
          zIndex: 1
        }} />
        <div className="container" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '8px 10px' : '40px 20px',
          boxSizing: 'border-box',
          width: '100%',
          position: 'relative',
          zIndex: 2
        }}>
          <h2 className="section-title" style={{fontSize: isMobile ? '1.3rem' : undefined, marginBottom: isMobile ? '10px' : undefined}}>Upcoming Event</h2>
          {latestEvent ? (
            <div className="latest-event" style={{
              backgroundColor: '#1a1a1a',
              borderRadius: isMobile ? '10px' : '15px',
              padding: isMobile ? '10px 12px' : '25px',
              border: '1px solid #333',
              textAlign: 'center',
              maxWidth: isMobile ? '100%' : '600px',
              margin: '0 auto',
              boxSizing: 'border-box'
            }}>
              {latestEvent.image_url && (
                <div style={{
                  position: 'relative',
                  height: isMobile ? '100px' : '200px',
                  width: '100%',
                  marginBottom: isMobile ? '8px' : '20px',
                  borderRadius: isMobile ? '6px' : '10px',
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
                fontSize: isMobile ? '1.1rem' : '1.8rem',
                marginBottom: isMobile ? '5px' : '10px'
              }}>
                <FontAwesomeIcon icon={faFlagCheckered} /> {latestEvent.name}
              </h3>
              <p style={{
                color: '#ccc',
                fontSize: isMobile ? '0.75rem' : '1.1rem',
                marginBottom: isMobile ? '4px' : '8px'
              }}>
                <FontAwesomeIcon icon={faCalendar} /> {new Date(latestEvent.event_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                {latestEvent.event_time && ` at ${latestEvent.event_time.substring(0, 5)}`}
              </p>
              {latestEvent.track_name && (
                <p style={{
                  color: '#ccc',
                  fontSize: isMobile ? '0.7rem' : '1rem',
                  marginBottom: isMobile ? '6px' : '15px'
                }}>
                  <FontAwesomeIcon icon={faFlagCheckered} /> {latestEvent.track_name}
                </p>
              )}
              {latestEvent.description && (
                <p style={{
                  color: '#b0b0b0',
                  fontSize: isMobile ? '0.7rem' : '0.95rem',
                  marginBottom: isMobile ? '8px' : '20px',
                  maxWidth: '600px',
                  margin: isMobile ? '0 auto 8px' : '0 auto 20px'
                }}>
                  {latestEvent.description}
                </p>
              )}
              <div style={{marginTop: isMobile ? '8px' : '20px'}}>
                <Link
                  href="/events"
                  className="btn-primary"
                  style={{
                    backgroundColor: '#3EA822',
                    color: 'white',
                    padding: isMobile ? '8px 16px' : '12px 24px',
                    borderRadius: isMobile ? '5px' : '8px',
                    textDecoration: 'none',
                    display: 'inline-block',
                    transition: 'background-color 0.3s ease',
                    fontSize: isMobile ? '0.8rem' : undefined
                  }}
                >
                  View All Events
                </Link>
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              color: '#b0b0b0',
              padding: '40px'
            }}>
              <div style={{fontSize: '3rem', marginBottom: '15px'}}><FontAwesomeIcon icon={faCalendar} /></div>
              <p>No upcoming events scheduled at the moment.</p>
              <p style={{fontSize: '0.9rem', marginTop: '10px', color: '#888'}}>Check back soon for new racing events!</p>
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
                View All Events
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Join Our Team Section */}
      <section className="section" style={{
        backgroundColor: '#0a0a0a',
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '5px',
        paddingBottom: '5px',
        overflow: 'hidden'
      }}>
        <div ref={joinBgRef} style={{position: 'absolute', top: '-20%', left: 0, right: 0, height: '140%', willChange: 'transform', zIndex: 0}}>
          <Image
            src="/images/decorative/Screenshot_2025-05-18_205724.png"
            alt=""
            fill
            sizes="100vw"
            quality={65}
            style={{objectFit: 'cover'}}
          />
        </div>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(rgba(10,10,10,0.7), rgba(10,10,10,0.8))',
          pointerEvents: 'none',
          zIndex: 1
        }} />
        <div className="container" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '8px 10px' : '40px 20px',
          boxSizing: 'border-box',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          <div className="join-team-box" style={{
            textAlign: 'center',
            padding: isMobile ? '15px 12px' : '50px 20px',
            backgroundColor: '#1a1a1a',
            borderRadius: isMobile ? '10px' : '15px',
            border: '2px solid #3EA822',
            maxWidth: isMobile ? '100%' : '600px',
            margin: '0 auto',
            boxSizing: 'border-box'
          }}>
            <div style={{fontSize: isMobile ? '1.5rem' : '2.5rem', marginBottom: isMobile ? '6px' : '15px'}}><FontAwesomeIcon icon={faRocket} /></div>
            <h3 style={{color: '#3EA822', marginBottom: isMobile ? '6px' : '10px', fontSize: isMobile ? '1.1rem' : '2rem', fontWeight: 'bold'}}>
              Want to join our winning team?
            </h3>
            <p style={{
              color: '#b0b0b0', 
              marginBottom: isMobile ? '10px' : '25px', 
              fontSize: isMobile ? '1.05rem' : '1.1rem', 
              maxWidth: '600px', 
              margin: isMobile ? '0 auto 10px' : '0 auto 25px',
              textShadow: isMobile ? '0 0 8px rgba(0, 0, 0, 0.9), 0 0 12px rgba(0, 0, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.9)' : undefined
            }}>
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
                padding: isMobile ? '8px 18px' : '15px 35px',
                borderRadius: isMobile ? '5px' : '8px',
                textDecoration: 'none',
                display: 'inline-block',
                fontSize: isMobile ? '0.8rem' : '1.1rem',
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
