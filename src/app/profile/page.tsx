'use client';

import { useState, useEffect, useRef } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  gamertag: string;
  experience: string;
  role: string;
  createdAt: string;
  bio?: string;
  profile_picture?: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    gamertag: '',
    experience: '',
    bio: '',
    email: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setFormData({
          name: userData.name || '',
          gamertag: userData.gamertag || '',
          experience: userData.experience || '',
          bio: userData.bio || '',
          email: userData.email || ''
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
        gamertag: user.gamertag || '',
        experience: user.experience || '',
        bio: user.bio || '',
        email: user.email || ''
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
    <div className="min-h-screen" style={{backgroundColor: '#0a0a0a', paddingTop: '100px', paddingBottom: hasChanges ? '100px' : '50px'}}>
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
            <div style={{backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '10px', marginBottom: '20px'}}>
              <div style={{textAlign: 'center', marginBottom: '30px'}}>
                <div style={{position: 'relative', display: 'inline-block'}}>
                  {user.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt="Profile"
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
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        color: 'white',
                        border: '3px solid #3EA822',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(62, 168, 34, 0.3)'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        right: '0',
                        bottom: '0',
                        background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                        borderRadius: '50%'
                      }} />
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 2
                      }}>
                        <div style={{
                          fontSize: '3rem',
                          lineHeight: '1',
                          marginBottom: '4px',
                          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}>
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div style={{
                          fontSize: '0.6rem',
                          opacity: '0.9',
                          fontWeight: '600',
                          letterSpacing: '1.5px',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}>
                          VESSIA
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
                    Gamertag:
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.gamertag}
                      onChange={(e) => handleInputChange('gamertag', e.target.value)}
                      style={{
                        width: '100%',
                        color: '#fff',
                        padding: '10px',
                        backgroundColor: '#0a0a0a',
                        border: '2px solid #3EA822',
                        borderRadius: '5px',
                        fontSize: '1rem'
                      }}
                      placeholder="Enter your gamertag"
                    />
                  ) : (
                    <p style={{color: '#fff', padding: '10px', backgroundColor: '#0a0a0a', borderRadius: '5px'}}>
                      {user.gamertag || 'Not specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{display: 'block', color: '#3EA822', fontWeight: 'bold', marginBottom: '8px'}}>
                    Experience Level:
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      style={{
                        width: '100%',
                        color: '#fff',
                        padding: '10px',
                        backgroundColor: '#0a0a0a',
                        border: '2px solid #3EA822',
                        borderRadius: '5px',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="">Select experience level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="professional">Professional</option>
                    </select>
                  ) : (
                    <p style={{color: '#fff', padding: '10px', backgroundColor: '#0a0a0a', borderRadius: '5px'}}>
                      {user.experience || 'Not specified'}
                    </p>
                  )}
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
                    Member Since:
                  </label>
                  <p style={{color: '#fff', padding: '10px', backgroundColor: '#0a0a0a', borderRadius: '5px'}}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
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