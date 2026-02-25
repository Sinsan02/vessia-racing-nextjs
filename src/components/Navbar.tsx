'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  profile_picture?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const hasCheckedAuth = useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    // Check screen size
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    // Prevent body scroll when mobile menu is open
    if (isMenuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen, isMobile]);

  useEffect(() => {
    // Prevent double mounting in StrictMode
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;
    
    // Check if user is logged in
    checkAuthStatus();
    
    // Re-check auth status every 5 minutes (reduced from 30s)
    const interval = setInterval(checkAuthStatus, 300000);
    
    // Listen for profile updates
    const handleProfileUpdate = () => {
      checkAuthStatus();
    };
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuthStatus();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && !(event.target as Element)?.closest('.user-menu')) {
        setIsDropdownOpen(false);
      }
      
      // Close mobile menu when clicking outside
      if (isMenuOpen && !(event.target as Element)?.closest('.nav-menu') && !(event.target as Element)?.closest('.mobile-menu-toggle')) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isMenuOpen]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-cache'
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
      // Force a full page reload to ensure auth status is cleared
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="navbar">
        {/* Overlay for mobile menu */}
        {isMenuOpen && isMobile && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: 999,
              animation: 'fadeIn 0.3s ease'
            }}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
        
        <div className="nav-container">
          <div className="nav-logo">
            <Link href="/">
              <Image 
                src="/Vessia_Logo.png" 
                alt="Vessia Racing" 
                width={200}
                height={200}
                priority
                quality={100}
                style={{height: 'auto', width: '100%', maxWidth: '60px'}}
              />
            </Link>
          </div>
          
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
          
          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <Link href="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link href="/achievements" className="nav-link" onClick={() => setIsMenuOpen(false)}>Accomplishments</Link>
            <Link href="/drivers" className="nav-link" onClick={() => setIsMenuOpen(false)}>Drivers</Link>
            <Link href="/gallery" className="nav-link" onClick={() => setIsMenuOpen(false)}>Gallery</Link>
            <Link href="/results" className="nav-link" onClick={() => setIsMenuOpen(false)}>Championship</Link>
            <Link href="/events" className="nav-link" onClick={() => setIsMenuOpen(false)}>Events</Link>
            
            <div id="authNavigation">
              {user ? (
                <div className="user-menu">
                  <div 
                    className="user-profile-btn" 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      padding: '8px 12px',
                      borderRadius: '20px',
                      background: 'transparent',
                      border: '1px solid rgba(62, 168, 34, 0.5)',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}
                  >
                    <div 
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: user.profile_picture ? 'transparent' : '#3EA822',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '8px',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        overflow: 'hidden',
                        border: user.profile_picture ? '2px solid #3EA822' : 'none'
                      }}
                    >
                      {user.profile_picture ? (
                        <img
                          src={user.profile_picture}
                          alt="Profile"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        user.name ? user.name.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>
                    <span style={{color: '#fff', fontWeight: '500'}}>{user.name}</span>
                    <span style={{color: '#3EA822', marginLeft: '8px', fontSize: '12px'}}>▼</span>
                    
                    {isDropdownOpen && (
                      <div 
                        className="user-dropdown"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          ...(isMobile ? { left: '-100px' } : { right: '0' }),
                          marginTop: '8px',
                          background: '#1a1a1a',
                          border: '1px solid #333',
                          borderRadius: '8px',
                          minWidth: isMobile ? '160px' : '200px',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                          zIndex: 1000
                        }}
                      >
                        <Link 
                          href="/profile" 
                          className="dropdown-item"
                          style={{
                            display: 'block',
                            padding: '12px 16px',
                            color: '#fff',
                            textDecoration: 'none',
                            borderBottom: '1px solid #333',
                            transition: 'background-color 0.3s ease'
                          }}
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsMenuOpen(false);
                          }}
                          onMouseEnter={(e) => (e.target as any).style.backgroundColor = '#333'}
                          onMouseLeave={(e) => (e.target as any).style.backgroundColor = 'transparent'}
                        >
                          👤 Min Profil
                        </Link>
                        {user.role === 'admin' && (
                          <Link 
                            href="/admin" 
                            className="dropdown-item"
                            style={{
                              display: 'block',
                              padding: '12px 16px',
                              color: '#fff',
                              textDecoration: 'none',
                              borderBottom: '1px solid #333',
                              transition: 'background-color 0.3s ease'
                            }}
                            onClick={() => {
                              setIsDropdownOpen(false);
                              setIsMenuOpen(false);
                            }}
                            onMouseEnter={(e) => (e.target as any).style.backgroundColor = '#333'}
                            onMouseLeave={(e) => (e.target as any).style.backgroundColor = 'transparent'}
                          >
                            ⚙️ Admin Panel
                          </Link>
                        )}
                        <button 
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsMenuOpen(false);
                            handleLogout();
                          }}
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '12px 16px',
                            color: '#dc3545',
                            background: 'none',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease',
                            fontSize: '14px'
                          }}
                          onMouseEnter={(e) => (e.target as any).style.backgroundColor = '#333'}
                          onMouseLeave={(e) => (e.target as any).style.backgroundColor = 'transparent'}
                        >
                          🚪 Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Link href="/login" className="nav-link login-btn" onClick={() => setIsMenuOpen(false)}>
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
  );
}
