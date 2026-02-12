'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Event {
  id: number;
  name: string;
  description?: string;
  event_date: string;
  event_time?: string;
  image_url?: string;
  track_name?: string;
  created_at: string;
  users: {
    id: number;
    full_name: string;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    event_date: '',
    event_time: '',
    image_url: '',
    track_name: ''
  });

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    checkAuthStatus();
    fetchEvents();
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-cache'
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      console.log('Events API response:', data);
      
      if (data.success && data.events) {
        setEvents(data.events);
        console.log('Events loaded:', data.events.length, 'events');
        // Log which events have images
        data.events.forEach((event: Event, index: number) => {
          console.log(`Event ${index + 1} (${event.name}):`, {
            hasImage: !!event.image_url,
            imageUrl: event.image_url,
            imageType: event.image_url ? (event.image_url.includes('vercel-storage.com') ? 'Vercel Blob' : 'Direct URL') : 'No image'
          });
        });
      } else {
        console.error('Failed to load events:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let imageUrl = formData.image_url;
      
      // Upload file if selected
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        });
        
        const uploadData = await uploadResponse.json();
        if (uploadData.success) {
          imageUrl = uploadData.imageUrl;
          console.log('Image uploaded successfully:', imageUrl);
        } else {
          console.error('Upload failed:', uploadData.error);
          alert('Error uploading image: ' + uploadData.error);
          setUploading(false);
          return;
        }
      }
      
      const eventData = {
        ...formData,
        image_url: imageUrl
      };
      
      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        handleCancel();
        fetchEvents();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description || '',
      event_date: event.event_date,
      event_time: event.event_time || '',
      image_url: event.image_url || '',
      track_name: event.track_name || ''
    });
    setPreviewUrl(event.image_url || '');
    setShowCreateForm(true);
  };

  const handleDelete = async (eventId: number, eventName: string) => {
    if (!confirm(`Are you sure you want to delete "${eventName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchEvents();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingEvent(null);
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData({
      name: '',
      description: '',
      event_date: '',
      event_time: '',
      image_url: '',
      track_name: ''
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isEventPast = (dateString: string, timeString?: string) => {
    const eventDate = new Date(dateString);
    
    if (timeString) {
      // If we have a time, combine date and time for accurate comparison
      const [hours, minutes] = timeString.split(':');
      eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      // If no time specified, consider it past only after the full day has passed
      eventDate.setHours(23, 59, 59, 999);
    }
    
    return eventDate < new Date();
  };

  return (
    <div className="min-h-screen" style={{
      paddingTop: '100px',
      backgroundImage: isMobile
        ? 'linear-gradient(180deg, #0d1f0d 0%, #1a3e1a 20%, #1a3e1a 90%, #0d1f0d 100%)'
        : `linear-gradient(rgba(10,10,10,0.9), rgba(10,10,10,0.9)), url('/images/decorative/Skjermbilde 2026-01-30 214430.png')`,
      backgroundColor: '#0a0a0a',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'scroll',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
      position: 'relative'
    }}>
      <main style={{padding: '20px'}}>
        <div className="container">
          {/* Header */}
          <div className="events-header" style={{textAlign: 'center', marginBottom: '30px'}}>
            <h1 style={{color: '#3EA822', fontSize: '2.5rem', marginBottom: '1rem'}}>
              🏁 Racing Events
            </h1>
            <p style={{color: '#ccc', fontSize: '1.1rem', marginTop: '15px'}}>
              Stay updated with all Vessia Racing events and competitions
            </p>
          </div>

          {/* Admin Create Event Button */}
          {user?.role === 'admin' && !showCreateForm && (
            <div style={{textAlign: 'center', marginBottom: '30px'}}>
              <button
                onClick={() => setShowCreateForm(true)}
                style={{
                  backgroundColor: '#3EA822',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2d7a1a'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3EA822'}
              >
                📅 Create New Event
              </button>
            </div>
          )}

          {/* Create/Edit Event Form */}
          {showCreateForm && user?.role === 'admin' && (
            <div className="create-event-form" style={{
              backgroundColor: '#1a1a1a',
              padding: '25px',
              borderRadius: '15px',
              marginBottom: '30px',
              border: '1px solid #333',
              maxWidth: '600px',
              margin: '0 auto 30px',
              width: '100%'
            }}>
              <h2 style={{color: '#3EA822', marginBottom: '20px', fontSize: '1.5rem'}}>
                {editingEvent ? '✏️ Edit Event' : '📅 Create New Event'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '25px'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', color: '#ccc'}}>Event Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #555',
                        backgroundColor: '#2a2a2a',
                        color: '#fff',
                        borderRadius: '5px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', color: '#ccc'}}>Event Date *</label>
                    <input
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #555',
                        backgroundColor: '#2a2a2a',
                        color: '#fff',
                        borderRadius: '5px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', color: '#ccc'}}>Event Time</label>
                    <input
                      type="time"
                      value={formData.event_time}
                      onChange={(e) => setFormData({...formData, event_time: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #555',
                        backgroundColor: '#2a2a2a',
                        color: '#fff',
                        borderRadius: '5px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', color: '#ccc'}}>Track Name</label>
                    <input
                      type="text"
                      value={formData.track_name}
                      onChange={(e) => setFormData({...formData, track_name: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #555',
                        backgroundColor: '#2a2a2a',
                        color: '#fff',
                        borderRadius: '5px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', color: '#ccc'}}>Event Image</label>
                    <div style={{marginBottom: '8px'}}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setSelectedFile(file);
                          
                          // Create preview URL
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setPreviewUrl(url);
                          } else {
                            setPreviewUrl(editingEvent?.image_url || '');
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid #555',
                          backgroundColor: '#2a2a2a',
                          color: '#fff',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                    
                    {/* Image Preview */}
                    {previewUrl && (
                      <div style={{
                        marginTop: '10px',
                        padding: '10px',
                        border: '1px solid #555',
                        borderRadius: '5px',
                        backgroundColor: '#222'
                      }}>
                        <p style={{color: '#3EA822', fontSize: '0.9rem', margin: '0 0 8px 0'}}>
                          Preview:
                        </p>
                        <img
                          src={previewUrl}
                          alt="Preview"
                          style={{
                            width: '100%',
                            maxWidth: '300px',
                            height: 'auto',
                            borderRadius: '5px',
                            border: '2px solid #3EA822'
                          }}
                          onLoad={() => {
                            // Cleanup old object URL if it's a blob URL
                            if (previewUrl.startsWith('blob:') && previewUrl !== (editingEvent?.image_url || '')) {
                              // This is a newly created blob URL, keep it
                            }
                          }}
                        />
                      </div>
                    )}
                    
                    {selectedFile && (
                      <p style={{color: '#3EA822', fontSize: '0.9rem', margin: '8px 0 0 0'}}>
                        Selected: {selectedFile.name}
                      </p>
                    )}
                    {!selectedFile && editingEvent?.image_url && (
                      <p style={{color: '#888', fontSize: '0.9rem', margin: '8px 0 0 0'}}>
                        Current image: {editingEvent.image_url.includes('vercel-storage.com') ? 
                          'Uploaded image' : 
                          editingEvent.image_url.split('/').pop()
                        }
                      </p>
                    )}
                  </div>
                </div>
                
                <div style={{marginTop: '20px'}}>
                  <label style={{display: 'block', marginBottom: '8px', color: '#ccc'}}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #555',
                      backgroundColor: '#2a2a2a',
                      color: '#fff',
                      borderRadius: '5px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                  <button
                    type="submit"
                    disabled={uploading}
                    style={{
                      backgroundColor: uploading ? '#6c757d' : '#3EA822',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '5px',
                      cursor: uploading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {uploading ? (
                      editingEvent ? 'Updating...' : 'Creating...'
                    ) : (
                      editingEvent ? 'Update Event' : 'Create Event'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Events List */}
          {loading ? (
            <div style={{textAlign: 'center', color: '#888', padding: '40px'}}>
              <div style={{fontSize: '2rem', marginBottom: '15px'}}>🏁</div>
              <p>Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div style={{textAlign: 'center', color: '#888', padding: '40px'}}>
              <p>No events have been created yet.</p>
            </div>
          ) : (
            <div className="events-list" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '25px',
              maxWidth: '900px',
              margin: '0 auto',
              padding: '0 15px'
            }}>
              {events.map((event) => (
                <div
                  key={event.id}
                  className="event-card"
                  style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '15px',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 30px rgba(62, 168, 34, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  {/* Event Image */}
                  {event.image_url ? (
                    <div style={{position: 'relative', height: '200px', width: '100%'}}>
                      <Image
                        src={event.image_url}
                        alt={event.name}
                        fill
                        style={{objectFit: 'contain', backgroundColor: '#222'}}
                        onError={(e) => {
                          console.error('Image load failed for:', event.name, event.image_url);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully for:', event.name, event.image_url);
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      height: '200px', 
                      width: '100%', 
                      backgroundColor: '#333',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#666'
                    }}>
                      <div style={{textAlign: 'center'}}>
                        <div style={{fontSize: '2rem', marginBottom: '8px'}}>🏁</div>
                        <div>No image</div>
                      </div>
                    </div>
                  )}

                  <div style={{padding: '20px'}}>
                    {/* Event Status */}
                    <div style={{marginBottom: '10px'}}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        backgroundColor: isEventPast(event.event_date, event.event_time) ? '#dc3545' : '#3EA822',
                        color: 'white'
                      }}>
                        {isEventPast(event.event_date, event.event_time) ? '✅ Completed' : '📅 Upcoming'}
                      </span>
                    </div>

                    {/* Event Name */}
                    <h3 style={{color: '#3EA822', fontSize: '1.4rem', marginBottom: '10px', marginTop: '0'}}>
                      {event.name}
                    </h3>

                    {/* Event Date */}
                    <p style={{color: '#ccc', marginBottom: '8px'}}>
                      📅 {formatDate(event.event_date)}
                      {event.event_time && ` at ${event.event_time.substring(0, 5)}`}
                    </p>

                    {/* Description */}
                    {event.description && (
                      <p style={{color: '#888', fontSize: '0.9rem', marginBottom: '15px'}}>
                        {event.description}
                      </p>
                    )}

                    {/* Created By */}
                    <p style={{color: '#666', fontSize: '0.8rem', marginBottom: '15px'}}>
                      Created by {event.users.full_name} • {formatDate(event.created_at)}
                    </p>

                    {/* Admin Actions */}
                    {user?.role === 'admin' && (
                      <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                        <button
                          onClick={() => handleEdit(event)}
                          style={{
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event.id, event.name)}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}