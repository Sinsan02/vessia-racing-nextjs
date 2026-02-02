'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        // Show popup with user's name from login response
        alert(`Velkommen ${data.user.name}! 🏁`);
        // Redirect to home and force a full page reload to ensure auth status updates
        router.push('/');
        // Force reload after a brief delay to ensure navigation completes
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } else {
        const data = await response.json();
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen" style={{
      backgroundColor: '#0a0a0a',
      backgroundImage: isMobile
        ? 'none'
        : `linear-gradient(rgba(10,10,10,0.85), rgba(10,10,10,0.85)), url('/images/decorative/ChatGPT Image 30. jan. 2026, 22_05_23.png')`,
      background: isMobile
        ? 'linear-gradient(135deg, #0d1f0d 0%, #1a2e1a 25%, #0d1f0d 50%, #1a2e1a 75%, #0d1f0d 100%)'
        : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'scroll'
    }}>
      <div className="form-container">
        <h2 className="form-title">✓ Sign In</h2>
        
        {error && (
          <div style={{backgroundColor: '#dc3545', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '1rem', textAlign: 'center'}}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{width: '100%'}}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div className="form-link">
          <p>Don't have an account? <Link href="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
}