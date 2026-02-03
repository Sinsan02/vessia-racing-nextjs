'use client';

import { useEffect, useState } from 'react';

export default function MobileWarning() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone', 'mobile'];
      const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
      const isMobileWidth = window.innerWidth <= 768;
      
      setIsMobile(isMobileUA || isMobileWidth);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(180deg, #0d1f0d 0%, #1a3e1a 50%, #0d1f0d 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'rgba(26, 26, 26, 0.95)',
        padding: '40px 30px',
        borderRadius: '15px',
        border: '2px solid #3EA822',
        maxWidth: '400px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '20px'
        }}>🖥️</div>
        
        <h1 style={{
          color: '#3EA822',
          fontSize: '1.8rem',
          marginBottom: '20px',
          fontFamily: 'var(--font-racing-sans-one), "Racing Sans One", Impact, sans-serif',
          letterSpacing: '0.1em',
          textTransform: 'uppercase'
        }}>
          VessiaRacing
        </h1>
        
        <p style={{
          color: '#ffffff',
          fontSize: '1.1rem',
          marginBottom: '15px',
          lineHeight: '1.6'
        }}>
          Denne websiden er kun tilgjengelig på PC.
        </p>
        
        <p style={{
          color: '#cccccc',
          fontSize: '0.95rem',
          lineHeight: '1.5'
        }}>
          Vennligst besøk oss fra en stasjonær eller bærbar PC for den beste opplevelsen.
        </p>
        
        <div style={{
          marginTop: '25px',
          paddingTop: '25px',
          borderTop: '1px solid #333'
        }}>
          <p style={{
            color: '#888',
            fontSize: '0.85rem'
          }}>
            Mobil versjon kommer snart
          </p>
        </div>
      </div>
    </div>
  );
}
