'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export const dynamic = "force-dynamic";

export default function Home() {
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [latestEvent, setLatestEvent] = useState<any>(null);

  
  useEffect(() => {
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

    // Fetch latest event
    fetchLatestEvent();
  }, []);

  const fetchLatestEvent = async () => {
    try {
      const response = await fetch('/api/events/latest');
      const data = await response.json();
      if (data.success && data.event) {
        setLatestEvent(data.event);
      }
    } catch (error) {
      console.error('Failed to fetch latest event:', error);
    }
  };

  return (
    <div>
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
      <section className="hero">
        <div className="hero-content">
          <Image 
            src="/Vessia_Logo.png" 
            alt="Vessia Racing" 
            width={400} 
            height={400} 
            style={{maxWidth: '400px', height: 'auto', marginBottom: '20px'}}
            priority
          />
          <p className="hero-subtitle">Professional Sim Racing Team</p>
          <p className="hero-description">Competing at the highest level in sim racing with dedication, precision and teamwork</p>
          <div className="hero-buttons">
            <Link href="#team" className="btn-primary">Meet the Team</Link>
            <Link href="/register" className="btn-secondary">Join Team</Link>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="section">
        <div className="container">
          <h2 className="section-title">Our Team</h2>
          <div className="team-grid">
            <div className="team-card">
              <div className="team-avatar">
                <i className="fas fa-user"></i>
              </div>
              <h3>Team Leader</h3>
              <p>Strategic leadership and coordination</p>
            </div>
            <div className="team-card">
              <div className="team-avatar">
                <i className="fas fa-racing-car"></i>
              </div>
              <h3>Lead Driver</h3>
              <p>Main driver and mentoring</p>
            </div>
            <div className="team-card">
              <div className="team-avatar">
                <i className="fas fa-tools"></i>
              </div>
              <h3>Setup Engineer</h3>
              <p>Car setup and technical analysis</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Event Section */}
      <section id="results" className="section section-dark">
        <div className="container">
          <h2 className="section-title">Latest Event</h2>
          {latestEvent ? (
            <div className="latest-event" style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '15px',
              padding: '25px',
              border: '1px solid #333',
              textAlign: 'center'
            }}>
              {latestEvent.image_url && (
                <div style={{
                  position: 'relative',
                  height: '250px',
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


    </div>
  );
}
