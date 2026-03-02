'use client';

import { useState, useEffect, useRef } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  experience: string;
  role: string;
  createdAt: string;
  bio?: string;
  profile_picture?: string;
  iracing_customer_id?: string;
  iracing_data?: {
    irating?: number;
    safety_rating?: string;
    license_class?: string;
    license_level?: number;
    last_updated?: string;
  };
  iracing_data_updated_at?: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isSyncingStats, setIsSyncingStats] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    email: '',
    iracing_customer_id: ''
  });

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    fetchUserProfile();
    
    // Check for OAuth callback messages
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    
    if (success === 'iracing_connected') {
      setSuccessMessage('🎉 Successfully connected to iRacing! Fetching your stats...');
      // Clear URL params
      window.history.replaceState({}, '', '/profile');
      // Automatically fetch stats after connection
      setTimeout(() => syncIRacingStats(), 1000);
    } else if (error) {
      const errorMessages: { [key: string]: string } = {
        'iracing_auth_failed': '❌ Failed to connect to iRacing. Please try again.',
        'iracing_config_error': '❌ iRacing OAuth not configured on server. Contact administrator.',
        'pkce_missing': '❌ Security verification failed. Please try again.',
        'token_exchange_failed': '❌ Authentication failed. Please try again.',
        'no_access_token': '❌ Failed to receive access token. Please try again.',
        'userinfo_failed': '❌ Could not fetch iRacing profile. Please try again.',
        'no_customer_id': '❌ Could not find iRacing Customer ID.',
        'not_authenticated': '❌ Please log in first.',
        'invalid_session': '❌ Your session expired. Please log in again.',
        'update_failed': '❌ Failed to save iRacing connection.',
        'state_mismatch': '❌ Security validation failed. Please try again.',
        'callback_error': '❌ Something went wrong. Please try again.'
      };
      setErrorMessage(errorMessages[error] || '❌ An error occurred. Please try again.');
      // Clear URL params
      window.history.replaceState({}, '', '/profile');
    }
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setFormData({
          name: userData.name || '',
          bio: userData.bio || '',
          email: userData.email || '',
          iracing_customer_id: userData.iracing_customer_id || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleDisconnectIRacing = async () => {
    if (!confirm('Er du sikker på at du vil koble fra iRacing? All synkronisert data vil bli fjernet.')) {
      return;
    }

    setIsDisconnecting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/auth/iracing/disconnect', {
        method: 'POST'
      });

      if (response.ok) {
        setSuccessMessage('✅ iRacing-koblingen er fjernet');
        // Refresh user data
        await fetchUserProfile();
      } else {
        setErrorMessage('❌ Kunne ikke fjerne iRacing-kobling. Prøv igjen.');
      }
    } catch (error) {
      console.error('Error disconnecting iRacing:', error);
      setErrorMessage('❌ En feil oppstod. Prøv igjen.');
    } finally {
    

  const syncIRacingStats = async () => {
    if (!user?.id) return;

    setIsSyncingStats(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/drivers/${user.id}/iracing-stats`, {
        method: 'POST'
      });

      if (response.ok) {
        setSuccessMessage('✅ iRacing stats synkronisert!');
        // Refresh user data to show new stats
        await fetchUserProfile();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || '❌ Kunne ikke hente iRacing stats. Prøv igjen.');
      }
    } catch (error) {
      console.error('Error syncing iRacing stats:', error);
      setErrorMessage('❌ En feil oppstod ved synkronisering. Prøv igjen.');
    } finally {
      setIsSyncingStats(false);
    }
  };  setIsDisconnecting(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setUser(prev => prev ? {...prev, profile_picture: result.imageUrl} : null);
        setHasChanges(true);
        
        // Trigger navbar update by dispatching a custom event
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    }
  };

  const saveProfile = async () => {
    if (!user || isSaving) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setHasChanges(false);
        setIsEditing(false);
        
        // Trigger navbar update
        window.dispatchEvent(new CustomEvent('profileUpdated'));
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEditing = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        email: user.email || '',
        iracing_customer_id: user.iracing_customer_id || ''
      });
    }
    setIsEditing(false);
    setHasChanges(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{backgroundColor: '#0a0a0a', paddingTop: '100px'}}>
        <div style={{textAlign: 'center', color: '#888', padding: '40px'}}>
          <div style={{fontSize: '2rem', marginBottom: '15px'}}>⏳</div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen" style={{backgroundColor: '#0a0a0a', paddingTop: '100px'}}>
        <div style={{textAlign: 'center', color: '#888', padding: '40px'}}>
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{
      backgroundColor: '#0a0a0a',
      paddingTop: '100px',
      paddingBottom: hasChanges ? '100px' : '50px',
      minHeight: '100vh',
      position: 'relative'
    }}>
      <main style={{padding: isMobile ? '20px 15px' : '25px', boxSizing: 'border-box', width: '100%', overflowX: 'hidden'}}>
        <div className="container" style={{maxWidth: '1200px', margin: '0 auto', padding: '0', boxSizing: 'border-box', width: '100%'}}>
          <div style={{textAlign: 'center', marginBottom: '30px'}}>
            <h1 style={{color: '#3EA822', fontSize: '2.5rem', marginBottom: '1rem'}}>
              👤 Min Profil
            </h1>
            <p style={{color: '#ccc', fontSize: '1.1rem'}}>Manage your Vessia Racing profile</p>
            
            {/* Success/Error Messages */}
            {successMessage && (
              <div style={{
                backgroundColor: 'rgba(62, 168, 34, 0.1)',
                border: '2px solid #3EA822',
                color: '#3EA822',
                padding: '15px',
                borderRadius: '8px',
                marginTop: '20px',
                marginBottom: '10px',
                textAlign: 'left'
              }}>
                {successMessage}
                <button
                  onClick={() => setSuccessMessage('')}
                  style={{
                    float: 'right',
                    background: 'none',
                    border: 'none',
                    color: '#3EA822',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}
                >
                  ×
                </button>
              </div>
            )}
            
            {errorMessage && (
              <div style={{
                backgroundColor: 'rgba(255, 68, 68, 0.1)',
                border: '2px solid #f44',
                color: '#f44',
                padding: '15px',
                borderRadius: '8px',
                marginTop: '20px',
                marginBottom: '10px',
                textAlign: 'left'
              }}>
                {errorMessage}
                <button
                  onClick={() => setErrorMessage('')}
                  style={{
                    float: 'right',
                    background: 'none',
                    border: 'none',
                    color: '#f44',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}
                >
                  ×
                </button>
              </div>
            )}
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  backgroundColor: '#3EA822',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  marginTop: '15px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          <div style={{maxWidth: '600px', margin: '0 auto'}}>
            <div style={{backgroundColor: isMobile ? 'transparent' : '#1a1a1a', padding: '30px', borderRadius: '10px', marginBottom: '20px', border: isMobile ? '1px solid rgba(62, 168, 34, 0.3)' : 'none'}}>
              <div style={{textAlign: 'center', marginBottom: '30px'}}>
                <div style={{position: 'relative', display: 'inline-block'}}>
                  {user.profile_picture && user.profile_picture.trim() && user.profile_picture !== '/uploads/default-avatar.png' ? (
                    <img
                      src={user.profile_picture}
                      alt="Profile"
                      onError={(e) => {
                        // Hvis bildet ikke laster, vis placeholder i stedet
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div style="
                              width: 120px;
                              height: 120px;
                              border-radius: 50%;
                              background: linear-gradient(135deg, #3EA822 0%, #2d7a1a 100%);
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              margin-bottom: 20px;
                              color: white;
                              border: 3px solid #3EA822;
                              position: relative;
                              overflow: hidden;
                              box-shadow: 0 8px 32px rgba(62, 168, 34, 0.4);
                              cursor: pointer;
                              font-size: 3rem;
                              font-weight: bold;
                            " onclick="document.getElementById('file-input').click();">
                              ${user.name ? user.name.charAt(0).toUpperCase() : 
                                user.email ? user.email.charAt(0).toUpperCase() : 'R'}
                            </div>
                          `;
                        }
                      }}
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        marginBottom: '20px',
                        border: '3px solid #3EA822'
                      }}
                    />
                  ) : (
                    <div 
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3EA822 0%, #2d7a1a 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px',
                        color: 'white',
                        border: '3px solid #3EA822',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(62, 168, 34, 0.4)',
                        cursor: 'pointer'
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {/* Gloss effect overlay */}
                      <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        right: '0',
                        bottom: '0',
                        background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)',
                        borderRadius: '50%'
                      }} />
                      
                      {/* Racing stripes pattern */}
                      <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        right: '0',
                        bottom: '0',
                        background: `repeating-linear-gradient(
                          45deg,
                          transparent,
                          transparent 8px,
                          rgba(255,255,255,0.1) 8px,
                          rgba(255,255,255,0.1) 12px
                        )`,
                        borderRadius: '50%',
                        opacity: '0.6'
                      }} />
                      
                      {/* Main content */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 3
                      }}>
                        {/* User initial */}
                        <div style={{
                          fontSize: '3.2rem',
                          lineHeight: '1',
                          marginBottom: '2px',
                          textShadow: '0 3px 6px rgba(0,0,0,0.6)',
                          fontWeight: 'bold'
                        }}>
                          {user.name ? user.name.charAt(0).toUpperCase() : 
                           user.email ? user.email.charAt(0).toUpperCase() : 'R'}
                        </div>
                        
                        {/* VESSIA RACING text */}
                        <div style={{
                          fontSize: '0.55rem',
                          opacity: '0.95',
                          fontWeight: '700',
                          letterSpacing: '1.8px',
                          textShadow: '0 2px 4px rgba(0,0,0,0.4)'
                        }}>
                          VESSIA
                        </div>
                        <div style={{
                          fontSize: '0.45rem',
                          opacity: '0.85',
                          fontWeight: '600',
                          letterSpacing: '1.2px',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                          marginTop: '-2px'
                        }}>
                          RACING
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {isEditing && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        position: 'absolute',
                        bottom: '20px',
                        right: '0',
                        backgroundColor: '#3EA822',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '35px',
                        height: '35px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem'
                      }}
                    >
                      📷
                    </button>
                  )}
                </div>

                <input
                  id="file-input"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{display: 'none'}}
                />
                
                <h2 style={{color: '#3EA822', marginBottom: '10px'}}>
                  {isEditing ? formData.name || 'Enter your name' : user.name}
                </h2>
                <p style={{color: '#888', fontSize: '0.9rem'}}>
                  Role: <span style={{color: user.role === 'admin' ? '#dc3545' : '#3EA822', fontWeight: 'bold'}}>{user.role}</span>
                </p>
              </div>

              <div style={{display: 'grid', gap: '20px'}}>
                <div>
                  <label style={{display: 'block', color: '#3EA822', fontWeight: 'bold', marginBottom: '8px'}}>
                    Full Name:
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      style={{
                        width: '100%',
                        color: '#fff',
                        padding: '10px',
                        backgroundColor: '#0a0a0a',
                        border: '2px solid #3EA822',
                        borderRadius: '5px',
                        fontSize: '1rem'
                      }}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p style={{color: '#fff', padding: '10px', backgroundColor: '#0a0a0a', borderRadius: '5px'}}>
                      {user.name || 'Not specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{display: 'block', color: '#3EA822', fontWeight: 'bold', marginBottom: '8px'}}>
                    Email:
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      style={{
                        width: '100%',
                        color: '#fff',
                        padding: '10px',
                        backgroundColor: '#0a0a0a',
                        border: '2px solid #3EA822',
                        borderRadius: '5px',
                        fontSize: '1rem'
                      }}
                      placeholder="Enter your email"
                    />
                  ) : (
                    <p style={{color: '#fff', padding: '10px', backgroundColor: '#0a0a0a', borderRadius: '5px'}}>
                      {user.email}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{display: 'block', color: '#3EA822', fontWeight: 'bold', marginBottom: '8px'}}>
                    Experience Level: <span style={{color: '#888', fontWeight: 'normal', fontSize: '0.9rem'}}>(Admin only)</span>
                  </label>
                  <p style={{color: '#fff', padding: '10px', backgroundColor: '#0a0a0a', borderRadius: '5px'}}>
                    {user.experience || 'Not specified'}
                  </p>
                </div>

                <div>
                  <label style={{display: 'block', color: '#3EA822', fontWeight: 'bold', marginBottom: '8px'}}>
                    Bio:
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      style={{
                        width: '100%',
                        color: '#fff',
                        padding: '10px',
                        backgroundColor: '#0a0a0a',
                        border: '2px solid #3EA822',
                        borderRadius: '5px',
                        fontSize: '1rem',
                        resize: 'vertical'
                      }}
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p style={{color: '#fff', padding: '10px', backgroundColor: '#0a0a0a', borderRadius: '5px'}}>
                      {user.bio || 'No bio available'}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{display: 'block', color: '#3EA822', fontWeight: 'bold', marginBottom: '8px'}}>
                    iRacing Integration:
                  </label>
                  {user.iracing_customer_id ? (
                    <div>
                      <div style={{
                        padding: '15px',
                        backgroundColor: '#0a0a0a',
                        bord⏳ Ingen stats ennå. Klikk &quot;Synkroniser nå&quot; for å hente dine stats.
                          </p>
                        )}
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        <button
                          onClick={syncIRacingStats}
                          disabled={isSyncingStats}
                          style={{
                            width: '100%',
                            padding: '10px 16px',
                            backgroundColor: isSyncingStats ? '#666' : '#3EA822',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            cursor: isSyncingStats ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.3s ease',
                            opacity: isSyncingStats ? 0.6 : 1,
                            marginBottom: '5px'
                          }}
                          onMouseEnter={(e) => !isSyncingStats && (e.currentTarget.style.backgroundColor = '#2d8518')}
                          onMouseLeave={(e) => !isSyncingStats && (e.currentTarget.style.backgroundColor = '#3EA822')}
                        >
                          {isSyncingStats ? '⏳ Synkroniserer...' : '🔄 Synkroniser nå'}
                        </button>
                        <p style={{color: '#888', fontSize: '0.85rem'}}>
                          📊 Stats oppdateres automatisk hver natt kl 02:00
                        
                        {user.iracing_data ? (
                          <div style={{display: 'grid', gap: '8px', marginTop: '12px'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#151515', borderRadius: '4px'}}>
                              <span style={{color: '#888'}}>iRating:</span>
                              <span style={{color: '#fff', fontWeight: 'bold'}}>{user.iracing_data.irating || 'N/A'}</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#151515', borderRadius: '4px'}}>
                              <span style={{color: '#888'}}>Safety Rating:</span>
                              <span style={{color: '#fff', fontWeight: 'bold'}}>{user.iracing_data.safety_rating || 'N/A'}</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#151515', borderRadius: '4px'}}>
                              <span style={{color: '#888'}}>License:</span>
                              <span style={{color: '#fff', fontWeight: 'bold'}}>{user.iracing_data.license_class || 'N/A'}</span>
                            </div>
                            {user.iracing_data_updated_at && (
                              <p style={{color: '#666', fontSize: '0.75rem', marginTop: '4px', textAlign: 'right'}}>
                                Last updated: {new Date(user.iracing_data_updated_at).toLocaleString('nb-NO')}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p style={{color: '#888', fontSize: '0.9rem', marginTop: '8px'}}>
                            No stats available yet. Stats will be synced automatically at 2 AM each night.
                          </p>
                        )}
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        <p style={{color: '#888', fontSize: '0.85rem'}}>
                          📊 Stats are automatically updated daily at 2:00 AM
                        </p>
                        <button
                          onClick={handleDisconnectIRacing}
                          disabled={isDisconnecting}
                          style={{
                            width: '100%',
                            padding: '10px 16px',
                            backgroundColor: isDisconnecting ? '#666' : '#d32f2f',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            cursor: isDisconnecting ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.3s ease',
                            opacity: isDisconnecting ? 0.6 : 1
                          }}
                          onMouseEnter={(e) => !isDisconnecting && (e.currentTarget.style.backgroundColor = '#b71c1c')}
                          onMouseLeave={(e) => !isDisconnecting && (e.currentTarget.style.backgroundColor = '#d32f2f')}
                        >
                          {isDisconnecting ? '⏳ Fjerner...' : '🔌 Koble fra iRacing'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={() => window.location.href = '/api/auth/iracing/authorize'}
                        style={{
                          width: '100%',
                          padding: '12px 20px',
                          backgroundColor: '#e8202f',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '5px',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ff3344'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e8202f'}
                      >
                        <span style={{fontSize: '1.2rem'}}>🏁</span>
                        Connect with iRacing
                      </button>
                      <p style={{color: '#888', fontSize: '0.85rem', marginTop: '8px'}}>
                        Login with your iRacing account to automatically sync your stats, iRating, and safety rating.
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{display: 'block', color: '#3EA822', fontWeight: 'bold', marginBottom: '8px'}}>
                    Member Since:
                  </label>
                  <p style={{color: '#fff', padding: '10px', backgroundColor: '#0a0a0a', borderRadius: '5px'}}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('nb-NO', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Unknown'}
                  </p>
                </div>
              </div>

              {isEditing && (
                <div style={{marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'center'}}>
                  <button
                    onClick={cancelEditing}
                    style={{
                      backgroundColor: '#666',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 'bold'
                    }}
                  >
                    ❌ Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Save Button */}
      {hasChanges && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          animation: 'slideUp 0.3s ease-out'
        }}>
          <button
            onClick={saveProfile}
            disabled={isSaving}
            style={{
              backgroundColor: '#3EA822',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '50px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 20px rgba(62, 168, 34, 0.3)',
              opacity: isSaving ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            {isSaving ? '⏳ Saving...' : '💾 Save Changes'}
          </button>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from {
            transform: translate(-50%, 100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}