'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Home() {
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    // Check for welcome message from URL params
    const params = new URLSearchParams(window.location.search);
    const message = params.get('message');
    if (message) {
      setWelcomeMessage(message);
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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

      {/* Results Section */}
      <section id="results" className="section section-dark">
        <div className="container">
          <h2 className="section-title">Recent Results</h2>
          <div className="results-grid">
            <div className="result-card">
              <div className="position">1st</div>
              <div className="race-info">
                <h4>Championship Final</h4>
                <p>Season 2024</p>
              </div>
            </div>
            <div className="result-card">
              <div className="position">2nd</div>
              <div className="race-info">
                <h4>League Tournament</h4>
                <p>Winter Series</p>
              </div>
            </div>
            <div className="result-card">
              <div className="position">1st</div>
              <div className="race-info">
                <h4>Sprint Championship</h4>
                <p>Weekly Challenge</p>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
