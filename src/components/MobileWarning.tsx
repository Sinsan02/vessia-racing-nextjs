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

  useEffect(() => {
    // Lås scrolling når mobil-varsel vises
    if (isMobile) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [isMobile]);

  if (!isMobile) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      minHeight: '-webkit-fill-available',
      background: 'linear-gradient(180deg, #0d1f0d 0%, #1a3e1a 20%, #1a3e1a 90%, #0d1f0d 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '15px',
      textAlign: 'center',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <div style={{
        background: 'rgba(26, 26, 26, 0.95)',
        padding: '35px 25px',
        borderRadius: '15px',
        border: '2px solid #3EA822',
        maxWidth: '340px',
        width: '85%',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
        margin: '0 auto',
        boxSizing: 'border-box'
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
          This website is only available on PC.
        </p>
        
        <p style={{
          color: '#cccccc',
          fontSize: '0.95rem',
          lineHeight: '1.5'
        }}>
          Please visit us from a desktop or laptop computer for the best experience.
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
            Mobile version coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
