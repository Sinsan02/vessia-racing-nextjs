'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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
        
        // Use router.push instead of window.location for better Next.js routing
        router.push('/');
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
    <div className="min-h-screen" style={{backgroundColor: '#0a0a0a'}}>
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