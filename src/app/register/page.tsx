'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    experience: 'beginner'
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
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
    setPasswordError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passordene er ikke like');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          experience: formData.experience
        }),
      });

      if (response.ok) {
        setSuccessMessage('Registrering vellykket! Du kan nå logge inn.');
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          experience: 'beginner'
        });
      } else {
        const data = await response.json();
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    const newFormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(newFormData);

    // Real-time validation for password matching
    if (name === 'confirmPassword' || name === 'password') {
      if (name === 'confirmPassword') {
        // User is typing in confirm password field
        if (value && newFormData.password && value !== newFormData.password) {
          setPasswordError('Passordene er ikke like');
        } else {
          setPasswordError('');
        }
      } else if (name === 'password') {
        // User is typing in password field
        if (newFormData.confirmPassword && value && newFormData.confirmPassword !== value) {
          setPasswordError('Passordene er ikke like');
        } else {
          setPasswordError('');
        }
      }
    }
  };

  return (
    <div className="min-h-screen" style={{
      backgroundColor: '#0a0a0a',
      backgroundImage: isMobile 
        ? 'none'
        : `linear-gradient(rgba(10,10,10,0.85), rgba(10,10,10,0.85)), url('/images/decorative/Image 30. jan. 2026, 22_05_23.png')`,
      background: isMobile
        ? 'linear-gradient(135deg, #0d1f0d 0%, #1a2e1a 25%, #0d1f0d 50%, #1a2e1a 75%, #0d1f0d 100%)'
        : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'scroll'
    }}>
      <div className="form-container">
        <h2 className="form-title">✓ Become a Member</h2>
        
        {successMessage && (
          <div style={{backgroundColor: '#28a745', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '1rem', textAlign: 'center'}}>
            {successMessage}
          </div>
        )}
        
        {error && (
          <div style={{backgroundColor: '#dc3545', color: 'white', padding: '10px', borderRadius: '5px', marginBottom: '1rem', textAlign: 'center'}}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
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
          <div className="form-group">
            <label htmlFor="confirmPassword">Gjenta passord:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {passwordError && (
              <div style={{color: '#dc3545', fontSize: '0.9rem', marginTop: '5px'}}>
                {passwordError}
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="experience">Experience Level:</label>
            <select 
              id="experience" 
              name="experience" 
              value={formData.experience}
              onChange={handleChange}
              style={{width: '100%', padding: '12px', border: '2px solid #333333', borderRadius: '5px', backgroundColor: '#0a0a0a', color: '#ffffff', fontSize: '1rem'}}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="professional">Professional</option>
            </select>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{width: '100%'}}
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Join Team'}
          </button>
        </form>
        <div className="form-link">
          <p>Already have an account? <Link href="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}