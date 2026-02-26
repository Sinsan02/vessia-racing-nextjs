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
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      height: 'auto',
      overflowY: 'scroll',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      touchAction: 'pan-y pan-x'
    }}>
      <main style={{padding: '25px'}}>
        <div className="container">
          <div style={{textAlign: 'center', marginBottom: '30px'}}>
            <h1 style={{color: '#3EA822', fontSize: '2.5rem', marginBottom: '1rem'}}>
              👤 Min Profil
            </h1>
            <p style={{color: '#ccc', fontSize: '1.1rem'}}>Manage your Vessia Racing profile</p>
            
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
                    iRacing Customer ID:
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        value={formData.iracing_customer_id}
                        onChange={(e) => handleInputChange('iracing_customer_id', e.target.value)}
                        style={{
                          width: '100%',
                          color: '#fff',
                          padding: '10px',
                          backgroundColor: '#0a0a0a',
                          border: '2px solid #3EA822',
                          borderRadius: '5px',
                          fontSize: '1rem'
                        }}
                        placeholder="Enter your iRacing Customer ID"
                      />
                      <p style={{color: '#888', fontSize: '0.85rem', marginTop: '5px'}}>
                        Find your Customer ID in your iRacing profile URL or settings. This enables auto-updating of your iRating and stats.
                      </p>
                    </div>
                  ) : (
                    <p style={{color: '#fff', padding: '10px', backgroundColor: '#0a0a0a', borderRadius: '5px'}}>
                      {user.iracing_customer_id || 'Not configured'}
                    </p>
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