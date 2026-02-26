'use client';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  experience: string;
  role: string;
  is_driver: number;
  created_at: string;
}

interface League {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

interface PointsDriver {
  id: number;
  full_name: string;
  points: number;
  races_completed: number;
  profile_picture?: string;
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [pointsDrivers, setPointsDrivers] = useState<PointsDriver[]>([]);
  const [leaguePoints, setLeaguePoints] = useState<PointsDriver[]>([]);
  const [leagueDrivers, setLeagueDrivers] = useState<number[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [selectedLeagueForDrivers, setSelectedLeagueForDrivers] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalAdmins: 0, totalDrivers: 0 });
  const [activeTab, setActiveTab] = useState('user-management');
  const [selectedLeague, setSelectedLeague] = useState('');
  
  // Form states
  const [leagueName, setLeagueName] = useState('');
  const [leagueDescription, setLeagueDescription] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [pointsToAdd, setPointsToAdd] = useState('25');
  const [racesToAdd, setRacesToAdd] = useState('1');

  // Accomplishment form states
  const [achievementTitle, setAchievementTitle] = useState('');
  const [achievementDrivers, setAchievementDrivers] = useState<string[]>(['']);
  const [achievementRaceName, setAchievementRaceName] = useState('');
  const [achievementTrackName, setAchievementTrackName] = useState('');
  const [achievementDate, setAchievementDate] = useState('');
  const [achievementPosition, setAchievementPosition] = useState('1');
  const [achievementCategory, setAchievementCategory] = useState('Race Victory');
  const [achievementIcon, setAchievementIcon] = useState('🏆');
  const [editingAchievementId, setEditingAchievementId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchLeagues();
    fetchAchievements();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
        calculateStats(data.users);
      } else {
        console.error('No users in response:', data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeagues = async () => {
    try {
      const response = await fetch('/api/leagues', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success && data.leagues) {
        setLeagues(data.leagues);
      }
    } catch (error) {
      console.error('Failed to fetch leagues:', error);
    }
  };

  const fetchLeaguePoints = async (leagueId: string) => {
    if (!leagueId) return;
    try {
      const response = await fetch(`/api/leagues/${leagueId}/points`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setPointsDrivers(data.points);
        setLeaguePoints(data.points);
      }
    } catch (error) {
      console.error('Failed to fetch league points:', error);
    }
  };

  const calculateStats = (users: User[]) => {
    setStats({
      totalUsers: users.length,
      totalAdmins: users.filter(user => user.role === 'admin').length,
      totalDrivers: users.filter(user => user.is_driver === 1).length
    });
  };

  const createLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leagueName.trim()) return;

    try {
      const response = await fetch('/api/leagues', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: leagueName, description: leagueDescription })
      });

      const data = await response.json();
      if (data.success) {
        alert(`League "${leagueName}" created successfully!`);
        setLeagueName('');
        setLeagueDescription('');
        fetchLeagues();
      } else {
        alert('Error creating league: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating league:', error);
      alert('Error creating league. Please try again.');
    }
  };

  const deleteLeague = async (leagueId: number, leagueName: string) => {
    if (!confirm(`Are you sure you want to delete the league "${leagueName}"?\n\nThis will permanently remove:\n- The league itself\n- All driver points for this league\n- All points history for this league\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      const response = await fetch(`/api/leagues/${leagueId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        alert(`League "${leagueName}" deleted successfully!`);
        fetchLeagues();
        if (selectedLeague === leagueId.toString()) {
          setSelectedLeague('');
          setPointsDrivers([]);
        }
      } else {
        alert('Error deleting league: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting league:', error);
      alert('Error deleting league. Please try again.');
    }
  };

  // Achievement functions
  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      const data = await response.json();
      if (data.success) {
        setAchievements(data.achievements);
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    }
  };

  const createAchievement = async () => {
    if (!achievementTitle || !achievementRaceName || !achievementDate) {
      alert('Please fill in title, race name, and date');
      return;
    }

    try {
      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: achievementTitle,
          description: achievementDrivers.filter(d => d.trim()).join(', '),
          race_name: achievementRaceName,
          track_name: achievementTrackName,
          achievement_date: achievementDate,
          position: parseInt(achievementPosition),
          category: achievementCategory,
          icon: achievementIcon
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Accomplishment created successfully!');
        setAchievementTitle('');
        setAchievementDrivers(['']);
        setAchievementRaceName('');
        setAchievementTrackName('');
        setAchievementDate('');
        setAchievementPosition('1');
        setAchievementCategory('Race Victory');
        setAchievementIcon('🏆');
        fetchAchievements();
      } else {
        alert('Error creating accomplishment: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating accomplishment:', error);
      alert('Error creating accomplishment');
    }
  };

  const updateAchievement = async () => {
    if (!editingAchievementId || !achievementTitle || !achievementRaceName || !achievementDate) {
      alert('Please fill in title, race name, and date');
      return;
    }

    try {
      const response = await fetch(`/api/achievements/${editingAchievementId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: achievementTitle,
          description: achievementDrivers.filter(d => d.trim()).join(', '),
          race_name: achievementRaceName,
          track_name: achievementTrackName,
          achievement_date: achievementDate,
          position: parseInt(achievementPosition),
          category: achievementCategory,
          icon: achievementIcon
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Accomplishment updated successfully!');
        setAchievementTitle('');
        setAchievementDrivers(['']);
        setAchievementRaceName('');
        setAchievementTrackName('');
        setAchievementDate('');
        setAchievementPosition('1');
        setAchievementCategory('Race Victory');
        setAchievementIcon('🏆');
        setEditingAchievementId(null);
        fetchAchievements();
      } else {
        alert('Error updating accomplishment: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating accomplishment:', error);
      alert('Error updating accomplishment');
    }
  };

  const deleteAchievement = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/achievements/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        alert('Accomplishment deleted successfully!');
        fetchAchievements();
      } else {
        alert('Error deleting accomplishment: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting accomplishment:', error);
      alert('Error deleting accomplishment');
    }
  };

  const startEditingAchievement = (achievement: any) => {
    setEditingAchievementId(achievement.id);
    setAchievementTitle(achievement.title);
    const drivers = achievement.description ? achievement.description.split(', ').filter((d: string) => d.trim()) : [''];
    setAchievementDrivers(drivers.length > 0 ? drivers : ['']);
    setAchievementRaceName(achievement.race_name);
    setAchievementTrackName(achievement.track_name || '');
    setAchievementDate(achievement.achievement_date);
    setAchievementPosition(achievement.position.toString());
    setAchievementCategory(achievement.category);
    setAchievementIcon(achievement.icon);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingAchievementId(null);
    setAchievementTitle('');
    setAchievementDrivers(['']);
    setAchievementRaceName('');
    setAchievementTrackName('');
    setAchievementDate('');
    setAchievementPosition('1');
    setAchievementCategory('Race Victory');
    setAchievementIcon('🏆');
  };

  // Driver management functions
  const addDriverField = () => {
    setAchievementDrivers([...achievementDrivers, '']);
  };

  const removeDriverField = (index: number) => {
    if (achievementDrivers.length > 1) {
      const newDrivers = achievementDrivers.filter((_, i) => i !== index);
      setAchievementDrivers(newDrivers);
    }
  };

  const updateDriverField = (index: number, value: string) => {
    const newDrivers = [...achievementDrivers];
    newDrivers[index] = value;
    setAchievementDrivers(newDrivers);
  };

  const toggleHomepageStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/achievements/${id}/homepage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ show_on_homepage: !currentStatus })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Accomplishment ${!currentStatus ? 'added to' : 'removed from'} homepage successfully!`);
        fetchAchievements();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error toggling homepage status:', error);
      alert('Error updating homepage status');
    }
  };

  const addPoints = async () => {
    if (!selectedLeague || !selectedDriver || !pointsToAdd || !racesToAdd) {
      alert('Please select a league, driver, and enter both points and races.');
      return;
    }

    if (parseInt(racesToAdd) < 0) {
      alert('Races cannot be negative.');
      return;
    }

    try {
      const response = await fetch(`/api/leagues/${selectedLeague}/points/${selectedDriver}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          points: parseInt(pointsToAdd),
          races: parseInt(racesToAdd)
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Successfully added ${pointsToAdd} points and ${racesToAdd} races!`);
        setPointsToAdd('25');
        setRacesToAdd('1');
        fetchLeaguePoints(selectedLeague);
      } else {
        alert('Error adding points: ' + data.error);
      }
    } catch (error) {
      console.error('Error adding points:', error);
      alert('Error adding points. Please try again.');
    }
  };

  const removePoints = async () => {
    if (!selectedLeague || !selectedDriver || !pointsToAdd || !racesToAdd) {
      alert('Please select a league, driver, and enter both points and races to remove.');
      return;
    }

    const pointsValue = parseInt(pointsToAdd);
    const racesValue = parseInt(racesToAdd);

    if (pointsValue < 0 || racesValue < 0) {
      alert('Points and races must be positive numbers when removing.');
      return;
    }

    try {
      const response = await fetch(`/api/leagues/${selectedLeague}/points/${selectedDriver}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          points: pointsValue,
          races: racesValue
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Successfully removed ${pointsValue} points and ${racesValue} races!`);
        setPointsToAdd('25');
        setRacesToAdd('1');
        fetchLeaguePoints(selectedLeague);
      } else {
        alert('Error removing points: ' + data.error);
      }
    } catch (error) {
      console.error('Error removing points:', error);
      alert('Error removing points. Please try again.');
    }
  };

  const resetLeaguePoints = async () => {
    if (!selectedLeague) {
      alert('Please select a league first.');
      return;
    }

    const leagueName = leagues.find(l => l.id.toString() === selectedLeague)?.name || '';
    
    if (!confirm(`Are you sure you want to reset ALL points for ${leagueName}? This action cannot be undone through the undo button.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/leagues/${selectedLeague}/reset`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        alert('League points reset successfully!');
        fetchLeaguePoints(selectedLeague);
      } else {
        alert('Error resetting points: ' + data.error);
      }
    } catch (error) {
      console.error('Error resetting points:', error);
      alert('Error resetting points. Please try again.');
    }
  };

  const undoLastAction = async () => {
    if (!selectedLeague) {
      alert('Please select a league first.');
      return;
    }

    try {
      const response = await fetch(`/api/leagues/${selectedLeague}/undo`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        alert('Last action undone successfully!');
        fetchLeaguePoints(selectedLeague);
      } else {
        alert('Error undoing action: ' + data.error);
      }
    } catch (error) {
      console.error('Error undoing action:', error);
      alert('Error undoing action. Please try again.');
    }
  };

  const updateUserRole = async (userId: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await response.json();
      if (data.success) {
        alert(`User role updated to ${newRole} successfully!`);
        fetchUsers(); // Refresh user list
      } else {
        alert('Error updating role: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error updating user role. Please try again.');
    }
  };

  const updateDriverStatus = async (userId: number, currentIsDriver: number) => {
    const newIsDriver = currentIsDriver === 1 ? 0 : 1;
    const action = newIsDriver ? 'promote to driver' : 'remove driver status';
    
    if (!confirm(`Are you sure you want to ${action} for this user?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/driver`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isDriver: newIsDriver === 1 })
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchUsers(); // Refresh user list
      } else {
        alert('Error updating driver status: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating driver status:', error);
      alert('Error updating driver status. Please try again.');
    }
  };

  const updateUserExperience = async (userId: number, newExperience: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/experience`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ experience: newExperience })
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchUsers(); // Refresh user list
      } else {
        alert('Error updating experience: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating experience:', error);
      alert('Error updating experience. Please try again.');
    }
  };

  const deleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone!`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchUsers(); // Refresh user list
      } else {
        alert('Error deleting user: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user. Please try again.');
    }
  };

  const handleLeagueChange = (leagueId: string) => {
    setSelectedLeague(leagueId);
    if (leagueId) {
      fetchLeaguePoints(leagueId);
    } else {
      setPointsDrivers([]);
    }
  };

  const fetchLeagueDrivers = async (leagueId: string) => {
    try {
      const response = await fetch(`/api/leagues/${leagueId}/drivers`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setLeagueDrivers(data.drivers || []);
      } else {
        console.error('Failed to fetch league drivers');
        setLeagueDrivers([]);
      }
    } catch (error) {
      console.error('Error fetching league drivers:', error);
      setLeagueDrivers([]);
    }
  };

  const addDriverToLeague = async (driverId: number) => {
    if (!selectedLeagueForDrivers) return;

    try {
      const response = await fetch(`/api/leagues/${selectedLeagueForDrivers}/drivers`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driverId })
      });

      const data = await response.json();
      if (data.success) {
        alert('Driver added to league successfully!');
        fetchLeagueDrivers(selectedLeagueForDrivers);
      } else {
        alert('Error adding driver: ' + data.error);
      }
    } catch (error) {
      console.error('Error adding driver to league:', error);
      alert('Error adding driver to league. Please try again.');
    }
  };

  const removeDriverFromLeague = async (driverId: number) => {
    if (!selectedLeagueForDrivers) return;

    try {
      const response = await fetch(`/api/leagues/${selectedLeagueForDrivers}/drivers/${driverId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        alert('Driver removed from league successfully!');
        fetchLeagueDrivers(selectedLeagueForDrivers);
      } else {
        alert('Error removing driver: ' + data.error);
      }
    } catch (error) {
      console.error('Error removing driver from league:', error);
      alert('Error removing driver from league. Please try again.');
    }
  };

  const handleLeagueDriversChange = (leagueId: string) => {
    setSelectedLeagueForDrivers(leagueId);
    if (leagueId) {
      fetchLeagueDrivers(leagueId);
    } else {
      setLeagueDrivers([]);
    }
  };

  return (
    <div className="min-h-screen" style={{
      backgroundColor: '#0a0a0a',
      paddingTop: '100px',
      paddingBottom: '40px',
      height: 'auto',
      overflowY: 'scroll',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      touchAction: 'pan-y pan-x'
    }}>
      <main style={{padding: '25px'}}>
        <div className="container">
          <div className="admin-header" style={{textAlign: 'center', marginBottom: '30px'}}>
            <h1 style={{color: '#3EA822', fontSize: '2.5rem', marginBottom: '1rem'}}>
              ⚙️ Administration Panel
            </h1>
            <p style={{color: '#ccc', fontSize: '1.1rem'}}>Manage users, leagues, and points for Vessia Racing</p>
          </div>

          {/* Admin Tabs */}
          <div className="admin-tabs" style={{display: 'flex', gap: '10px', marginBottom: '30px', justifyContent: 'center', flexWrap: 'wrap'}}>
            <button 
              className={`tab-button ${activeTab === 'user-management' ? 'active' : ''}`}
              onClick={() => setActiveTab('user-management')}
              style={{
                padding: '12px 20px',
                backgroundColor: activeTab === 'user-management' ? '#3EA822' : '#2a2a2a',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              👥 User Management
            </button>
            <button 
              className={`tab-button ${activeTab === 'league-management' ? 'active' : ''}`}
              onClick={() => setActiveTab('league-management')}
              style={{
                padding: '12px 20px',
                backgroundColor: activeTab === 'league-management' ? '#3EA822' : '#2a2a2a',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🏆 League Management
            </button>
            <button 
              className={`tab-button ${activeTab === 'points-management' ? 'active' : ''}`}
              onClick={() => setActiveTab('points-management')}
              style={{
                padding: '12px 20px',
                backgroundColor: activeTab === 'points-management' ? '#3EA822' : '#2a2a2a',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🏅 Points Management
            </button>
            <button 
              className={`tab-button ${activeTab === 'achievement-management' ? 'active' : ''}`}
              onClick={() => setActiveTab('achievement-management')}
              style={{
                padding: '12px 20px',
                backgroundColor: activeTab === 'achievement-management' ? '#3EA822' : '#2a2a2a',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🏆 Accomplishment Management
            </button>
          </div>

          {/* User Management Tab */}
          {activeTab === 'user-management' && (
            <div className="tab-content">
              {/* Admin Stats */}
              <div className="admin-stats" style={{display: 'flex', gap: '20px', marginBottom: '30px', justifyContent: 'center', flexWrap: 'wrap'}}>
                <div className="stat-card" style={{backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '10px', minWidth: '150px', textAlign: 'center'}}>
                  <div style={{fontSize: '2rem', marginBottom: '10px'}}>👥</div>
                  <h3 style={{color: '#3EA822', fontSize: '2rem', margin: '0'}}>{stats.totalUsers}</h3>
                  <p style={{color: '#ccc', margin: '5px 0 0'}}>Total Users</p>
                </div>
                <div className="stat-card" style={{backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '10px', minWidth: '150px', textAlign: 'center'}}>
                  <div style={{fontSize: '2rem', marginBottom: '10px'}}>👑</div>
                  <h3 style={{color: '#3EA822', fontSize: '2rem', margin: '0'}}>{stats.totalAdmins}</h3>
                  <p style={{color: '#ccc', margin: '5px 0 0'}}>Administrators</p>
                </div>
                <div className="stat-card" style={{backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '10px', minWidth: '150px', textAlign: 'center'}}>
                  <div style={{fontSize: '2rem', marginBottom: '10px'}}>🏎️</div>
                  <h3 style={{color: '#3EA822', fontSize: '2rem', margin: '0'}}>{stats.totalDrivers}</h3>
                  <p style={{color: '#ccc', margin: '5px 0 0'}}>Team Drivers</p>
                </div>
              </div>

              {/* Users Management */}
              <div className="admin-section" style={{backgroundColor: '#1a1a1a', padding: '25px', borderRadius: '15px'}}>
                <h2 style={{color: '#3EA822', marginBottom: '20px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px'}}>
                  👥 User Management
                </h2>
                
                {loading ? (
                  <div style={{textAlign: 'center', padding: '40px', color: '#ccc'}}>
                    Loading users...
                  </div>
                ) : (
                  <div className="table-responsive" style={{overflowX: 'auto'}}>
                    <table className="users-table" style={{width: '100%', borderCollapse: 'collapse'}}>
                      <thead>
                        <tr style={{borderBottom: '2px solid #3EA822'}}>
                          <th style={{textAlign: 'left', padding: '12px', color: '#3EA822'}}>Name</th>
                          <th style={{textAlign: 'left', padding: '12px', color: '#3EA822'}}>Email</th>
                          <th style={{textAlign: 'left', padding: '12px', color: '#3EA822'}}>Experience</th>
                          <th style={{textAlign: 'left', padding: '12px', color: '#3EA822'}}>Role</th>
                          <th style={{textAlign: 'left', padding: '12px', color: '#3EA822'}}>Driver Status</th>
                          <th style={{textAlign: 'left', padding: '12px', color: '#3EA822'}}>Created</th>
                          <th style={{textAlign: 'left', padding: '12px', color: '#3EA822'}}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} style={{borderBottom: '1px solid #444'}}>
                            <td style={{padding: '12px', color: '#fff'}}>{user.name}</td>
                            <td style={{padding: '12px', color: '#ccc'}}>{user.email}</td>
                            <td style={{padding: '12px'}}>
                              <select
                                value={user.experience}
                                onChange={(e) => updateUserExperience(user.id, e.target.value)}
                                style={{
                                  backgroundColor: '#2a2a2a',
                                  color: '#fff',
                                  border: '1px solid #555',
                                  borderRadius: '4px',
                                  padding: '4px 8px',
                                  fontSize: '0.9rem',
                                  cursor: 'pointer'
                                }}
                              >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Professional">Professional</option>
                                <option value="Expert">Expert</option>
                              </select>
                            </td>
                            <td style={{padding: '12px'}}>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                backgroundColor: user.role === 'admin' ? '#dc3545' : '#6c757d',
                                color: '#fff'
                              }}>
                                {user.role}
                              </span>
                            </td>
                            <td style={{padding: '12px'}}>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                backgroundColor: user.is_driver ? '#28a745' : '#6c757d',
                                color: '#fff'
                              }}>
                                {user.is_driver ? 'Driver' : 'Regular'}
                              </span>
                            </td>
                            <td style={{padding: '12px', color: '#ccc'}}>
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td style={{padding: '12px'}}>
                              <div style={{display: 'flex', gap: '5px', flexWrap: 'wrap'}}>
                                <button
                                  onClick={() => updateUserRole(user.id, user.role)}
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '0.7rem',
                                    backgroundColor: user.role === 'admin' ? '#6c757d' : '#17a2b8',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                  title={user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                >
                                  {user.role === 'admin' ? '👤 Remove Admin' : '👑 Make Admin'}
                                </button>
                                <button
                                  onClick={() => updateDriverStatus(user.id, user.is_driver)}
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '0.7rem',
                                    backgroundColor: user.is_driver ? '#6c757d' : '#28a745',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                  title={user.is_driver ? 'Remove Driver' : 'Make Driver'}
                                >
                                  {user.is_driver ? '🏎️ Remove Driver' : '🏎️ Make Driver'}
                                </button>
                                <button
                                  onClick={() => deleteUser(user.id, user.name)}
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '0.7rem',
                                    backgroundColor: '#dc3545',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                  title="Delete User"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* League Management Tab */}
          {activeTab === 'league-management' && (
            <div className="tab-content">
              {/* Create New League */}
              <div style={{backgroundColor: '#1a1a1a', borderRadius: '10px', padding: '20px', marginBottom: '30px'}}>
                <h3 style={{color: '#3EA822', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  ➕ Create New League
                </h3>
                <form onSubmit={createLeague} style={{display: 'flex', alignItems: 'flex-end', gap: '30px'}}>
                  <div style={{flex: '1', maxWidth: '200px'}}>
                    <label htmlFor="leagueName" style={{display: 'block', marginBottom: '8px', color: '#ccc'}}>League Name</label>
                    <input 
                      type="text" 
                      id="leagueName" 
                      value={leagueName}
                      onChange={(e) => setLeagueName(e.target.value)}
                      required 
                      style={{width: '100%', padding: '10px', border: '1px solid #555', backgroundColor: '#2a2a2a', color: '#fff', borderRadius: '5px'}}
                    />
                  </div>
                  <div style={{flex: '2', maxWidth: '300px'}}>
                    <label htmlFor="leagueDescription" style={{display: 'block', marginBottom: '8px', color: '#ccc'}}>Description</label>
                    <input 
                      type="text" 
                      id="leagueDescription" 
                      value={leagueDescription}
                      onChange={(e) => setLeagueDescription(e.target.value)}
                      style={{width: '100%', padding: '10px', border: '1px solid #555', backgroundColor: '#2a2a2a', color: '#fff', borderRadius: '5px'}}
                    />
                  </div>
                  <div style={{flex: '0 0 auto'}}>
                    <button type="submit" className="btn" style={{padding: '10px 20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', whiteSpace: 'nowrap'}}>
                      ➕ Create League
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Leagues */}
              <div style={{backgroundColor: '#1a1a1a', borderRadius: '10px', padding: '20px'}}>
                <h3 style={{color: '#17a2b8', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  📋 Existing Leagues
                </h3>
                <div>
                  {leagues.length === 0 ? (
                    <p style={{color: '#888', textAlign: 'center'}}>No leagues found.</p>
                  ) : (
                    leagues.map(league => (
                      <div key={league.id} style={{backgroundColor: '#2a2a2a', borderRadius: '8px', padding: '15px', marginBottom: '10px', borderLeft: '4px solid #3EA822'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                          <div style={{flexGrow: 1}}>
                            <h4 style={{margin: '0', color: '#3EA822'}}>{league.name}</h4>
                            <p style={{margin: '5px 0 0 0', color: '#ccc', fontSize: '0.9em'}}>{league.description || 'No description'}</p>
                            <small style={{color: '#888'}}>Created: {new Date(league.created_at).toLocaleDateString()}</small>
                          </div>
                          <div style={{marginLeft: '15px'}}>
                            <button 
                              onClick={() => deleteLeague(league.id, league.name)}
                              style={{padding: '8px 12px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer'}}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Driver League Management */}
              <div style={{backgroundColor: '#1a1a1a', borderRadius: '10px', padding: '20px', marginTop: '30px'}}>
                <h3 style={{color: '#ffc107', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  🏎️ Driver League Management
                </h3>
                
                {/* League Selection for Driver Management */}
                <div style={{marginBottom: '20px'}}>
                  <label htmlFor="selectedLeagueForDrivers" style={{display: 'block', marginBottom: '5px', color: '#ccc'}}>Select League to Manage</label>
                  <select 
                    id="selectedLeagueForDrivers" 
                    value={selectedLeagueForDrivers}
                    onChange={(e) => handleLeagueDriversChange(e.target.value)}
                    style={{width: '100%', maxWidth: '300px', padding: '10px', border: '1px solid #555', backgroundColor: '#2a2a2a', color: '#fff', borderRadius: '5px'}}
                  >
                    <option value="">Select a league...</option>
                    {leagues.map(league => (
                      <option key={league.id} value={league.id}>{league.name}</option>
                    ))}
                  </select>
                </div>

                {selectedLeagueForDrivers && (
                  <div>
                    <h4 style={{color: '#17a2b8', marginBottom: '15px'}}>
                      All Drivers - {leagues.find(l => l.id.toString() === selectedLeagueForDrivers)?.name}
                    </h4>
                    <div style={{display: 'grid', gap: '10px'}}>
                      {users.filter(user => user.is_driver === 1).map(driver => {
                        const isInLeague = leagueDrivers.includes(driver.id);
                        return (
                          <div key={driver.id} style={{
                            backgroundColor: '#2a2a2a',
                            borderRadius: '8px',
                            padding: '15px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderLeft: isInLeague ? '4px solid #3EA822' : '4px solid #6c757d'
                          }}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: '#3EA822',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold'
                              }}>
                                {driver.name ? driver.name.slice(0, 2).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <h5 style={{margin: '0', color: '#fff', fontSize: '1.1rem'}}>{driver.name}</h5>
                                <p style={{margin: '2px 0 0 0', color: '#ccc', fontSize: '0.9rem'}}>{driver.name}</p>
                                <small style={{color: isInLeague ? '#28a745' : '#888'}}>
                                  {isInLeague ? '✅ In League' : '⚫ Not in League'}
                                </small>
                              </div>
                            </div>
                            <div>
                              {isInLeague ? (
                                <button
                                  onClick={() => removeDriverFromLeague(driver.id)}
                                  style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#dc3545',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  ❌ Remove from League
                                </button>
                              ) : (
                                <button
                                  onClick={() => addDriverToLeague(driver.id)}
                                  style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#28a745',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  ➕ Add to League
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {users.filter(user => user.is_driver === 1).length === 0 && (
                        <p style={{color: '#888', textAlign: 'center', padding: '20px'}}>
                          No drivers found. Create some drivers first in the User Management tab.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Points Management Tab */}
          {activeTab === 'points-management' && (
            <div className="tab-content">
              {/* League Selection */}
              <div style={{backgroundColor: '#1a1a1a', borderRadius: '10px', padding: '20px', marginBottom: '30px'}}>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', alignItems: 'end'}}>
                  <div>
                    <label htmlFor="selectedLeague" style={{display: 'block', marginBottom: '5px', color: '#ccc'}}>Select League</label>
                    <select 
                      id="selectedLeague" 
                      value={selectedLeague}
                      onChange={(e) => handleLeagueChange(e.target.value)}
                      style={{width: '100%', padding: '10px', border: '1px solid #555', backgroundColor: '#2a2a2a', color: '#fff', borderRadius: '5px'}}
                    >
                      <option value="">Select a league...</option>
                      {leagues.map(league => (
                        <option key={league.id} value={league.id}>{league.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <button 
                      onClick={resetLeaguePoints}
                      disabled={!selectedLeague}
                      style={{
                        padding: '10px 20px', 
                        backgroundColor: selectedLeague ? '#dc3545' : '#555', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '5px', 
                        cursor: selectedLeague ? 'pointer' : 'not-allowed'
                      }}
                    >
                      🔄 Reset All Points
                    </button>
                  </div>
                  <div>
                    <button 
                      onClick={undoLastAction}
                      disabled={!selectedLeague}
                      style={{
                        padding: '10px 20px', 
                        backgroundColor: selectedLeague ? '#ffc107' : '#555', 
                        color: selectedLeague ? '#000' : '#fff', 
                        border: 'none', 
                        borderRadius: '5px', 
                        cursor: selectedLeague ? 'pointer' : 'not-allowed'
                      }}
                    >
                      ↶ Undo Last Action
                    </button>
                  </div>
                </div>
              </div>

              {selectedLeague && (
                <>
                  {/* Quick Points Assignment */}
                  <div style={{backgroundColor: '#1a1a1a', borderRadius: '10px', padding: '20px', marginBottom: '30px'}}>
                    <h3 style={{color: '#ffc107', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                      ➕ Quick Points Assignment
                    </h3>
                    <div style={{display: 'flex', alignItems: 'flex-end', gap: '15px', flexWrap: 'wrap'}}>
                      <div style={{flex: '2', maxWidth: '250px'}}>
                        <label htmlFor="selectedDriver" style={{display: 'block', marginBottom: '8px', color: '#ccc'}}>Select Driver</label>
                        <select 
                          id="selectedDriver" 
                          value={selectedDriver}
                          onChange={(e) => setSelectedDriver(e.target.value)}
                          style={{width: '100%', padding: '10px', border: '1px solid #555', backgroundColor: '#2a2a2a', color: '#fff', borderRadius: '5px'}}
                        >
                          <option value="">Select a driver...</option>
                          {users.filter(user => user.is_driver === 1).map(driver => {
                            const hasPoints = leaguePoints.some(lp => lp.id === driver.id);
                            return (
                              <option key={driver.id} value={driver.id}>
                                {driver.name} {hasPoints ? '✓' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div style={{flex: '0 0 80px', marginRight: '15px'}}>
                        <label htmlFor="pointsToAdd" style={{display: 'block', marginBottom: '8px', color: '#ccc'}}>Points</label>
                        <input 
                          type="number" 
                          id="pointsToAdd" 
                          value={pointsToAdd}
                          onChange={(e) => setPointsToAdd(e.target.value)}
                          style={{width: '100%', padding: '10px', border: '1px solid #555', backgroundColor: '#2a2a2a', color: '#fff', borderRadius: '5px'}}
                        />
                      </div>
                      <div style={{flex: '0 0 80px', marginRight: '15px'}}>
                        <label htmlFor="racesToAdd" style={{display: 'block', marginBottom: '8px', color: '#ccc'}}>Races</label>
                        <input 
                          type="number" 
                          id="racesToAdd" 
                          min="0" 
                          value={racesToAdd}
                          onChange={(e) => setRacesToAdd(e.target.value)}
                          style={{width: '100%', padding: '10px', border: '1px solid #555', backgroundColor: '#2a2a2a', color: '#fff', borderRadius: '5px'}}
                        />
                      </div>
                      <div style={{display: 'flex', gap: '10px'}}>
                        <button 
                          onClick={addPoints}
                          style={{padding: '10px 15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap'}}
                        >
                          + Add
                        </button>
                        <button 
                          onClick={removePoints}
                          style={{padding: '10px 15px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap'}}
                        >
                          - Remove
                        </button>
                      </div>
                    </div>
                    
                    {/* Common Point Values */}
                    <div style={{marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center'}}>
                      <span style={{color: '#ccc', marginRight: '10px'}}>Quick Add:</span>
                      {[25, 18, 15, 12, 10, 8, 6, 4, 2, 1].map(points => (
                        <button 
                          key={points}
                          onClick={() => setPointsToAdd(points.toString())}
                          style={{padding: '5px 10px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'}}
                        >
                          {points} pt{points !== 1 ? 's' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Points Standings */}
                  <div style={{backgroundColor: '#1a1a1a', borderRadius: '10px', padding: '20px'}}>
                    <h3 style={{color: '#28a745', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                      🏆 Current Standings
                    </h3>
                    {pointsDrivers.length === 0 ? (
                      <p style={{color: '#888', textAlign: 'center'}}>No drivers found in this league.</p>
                    ) : (
                      <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                          <tr style={{borderBottom: '2px solid #3EA822'}}>
                            <th style={{textAlign: 'left', padding: '10px', color: '#3EA822'}}>Position</th>
                            <th style={{textAlign: 'left', padding: '10px', color: '#3EA822'}}>Driver</th>
                            <th style={{textAlign: 'center', padding: '10px', color: '#3EA822'}}>Points</th>
                            <th style={{textAlign: 'center', padding: '10px', color: '#3EA822'}}>Races</th>
                            <th style={{textAlign: 'center', padding: '10px', color: '#3EA822'}}>Avg</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pointsDrivers.map((driver, index) => (
                            <tr key={driver.id} style={{borderBottom: '1px solid #555'}}>
                              <td style={{
                                padding: '10px', 
                                fontWeight: 'bold', 
                                color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#ccc'
                              }}>
                                {index + 1}
                              </td>
                              <td style={{padding: '10px'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                  <div style={{
                                    width: '30px', 
                                    height: '30px', 
                                    borderRadius: '50%', 
                                    backgroundColor: '#3EA822', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    color: '#fff', 
                                    fontWeight: 'bold',
                                    fontSize: '12px'
                                  }}>
                                    {(driver.full_name || 'U').slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div style={{color: '#fff', fontWeight: 'bold'}}>{driver.full_name}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{padding: '10px', textAlign: 'center', fontWeight: 'bold', color: '#3EA822'}}>
                                {driver.points}
                              </td>
                              <td style={{padding: '10px', textAlign: 'center', color: '#ccc'}}>
                                {driver.races_completed}
                              </td>
                              <td style={{padding: '10px', textAlign: 'center', color: '#ccc'}}>
                                {driver.races_completed > 0 ? (driver.points / driver.races_completed).toFixed(1) : '0.0'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Accomplishment Management Tab */}
          {activeTab === 'achievement-management' && (
            <div className="tab-content">
              <h2 style={{color: '#3EA822', textAlign: 'center', marginBottom: '20px'}}>🏆 Accomplishment Management</h2>
              
              {/* Info Box */}
              <div style={{
                backgroundColor: 'rgba(62, 168, 34, 0.1)',
                border: '1px solid #3EA822',
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '30px',
                textAlign: 'center'
              }}>
                <p style={{color: '#3EA822', margin: '0', fontSize: '0.9rem', fontWeight: 'bold'}}>
                  🏠 Homepage Control: Use the toggle buttons to select up to 3 accomplishments for homepage display
                </p>
              </div>
              
              {/* Create/Edit Accomplishment Form */}
              <div className="form-container" style={{
                backgroundColor: '#1a1a1a',
                padding: '30px',
                borderRadius: '10px',
                marginBottom: '30px',
                maxWidth: '800px',
                margin: '0 auto 30px'
              }}>
                <h3 style={{color: '#3EA822', marginBottom: '20px'}}>{editingAchievementId ? 'Edit Accomplishment' : 'Add New Accomplishment'}</h3>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
                  <div className="form-group">
                    <label style={{color: '#ccc', marginBottom: '5px', display: 'block'}}>Accomplishment Title *</label>
                    <input
                      type="text"
                      value={achievementTitle}
                      onChange={(e) => setAchievementTitle(e.target.value)}
                      placeholder="e.g. 24h Daytona Victory"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #555',
                        backgroundColor: '#2a2a2a',
                        color: '#fff'
                      }}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label style={{color: '#ccc', marginBottom: '5px', display: 'block'}}>Race Name *</label>
                    <input
                      type="text"
                      value={achievementRaceName}
                      onChange={(e) => setAchievementRaceName(e.target.value)}
                      placeholder="e.g. 24 Hours of Daytona"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #555',
                        backgroundColor: '#2a2a2a',
                        color: '#fff'
                      }}
                    />
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
                  <div className="form-group">
                    <label style={{color: '#ccc', marginBottom: '5px', display: 'block'}}>Track/Circuit</label>
                    <input
                      type="text"
                      value={achievementTrackName}
                      onChange={(e) => setAchievementTrackName(e.target.value)}
                      placeholder="e.g. Daytona International Speedway"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #555',
                        backgroundColor: '#2a2a2a',
                        color: '#fff'
                      }}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label style={{color: '#ccc', marginBottom: '5px', display: 'block'}}>Accomplishment Date *</label>
                    <input
                      type="date"
                      value={achievementDate}
                      onChange={(e) => setAchievementDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #555',
                        backgroundColor: '#2a2a2a',
                        color: '#fff'
                      }}
                    />
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px'}}>
                  <div className="form-group">
                    <label style={{color: '#ccc', marginBottom: '5px', display: 'block'}}>Position</label>
                    <select
                      value={achievementPosition}
                      onChange={(e) => setAchievementPosition(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #555',
                        backgroundColor: '#2a2a2a',
                        color: '#fff'
                      }}
                    >
                      <option value="1">1st Place</option>
                      <option value="2">2nd Place</option>
                      <option value="3">3rd Place</option>
                      <option value="4">4th Place</option>
                      <option value="5">5th Place</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label style={{color: '#ccc', marginBottom: '5px', display: 'block'}}>Category</label>
                    <select
                      value={achievementCategory}
                      onChange={(e) => setAchievementCategory(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #555',
                        backgroundColor: '#2a2a2a',
                        color: '#fff'
                      }}
                    >
                      <option value="Race Victory">Race Victory</option>
                      <option value="Endurance Victory">Endurance Victory</option>
                      <option value="Championship">Championship</option>
                      <option value="Pole Position">Pole Position</option>
                      <option value="Fastest Lap">Fastest Lap</option>
                      <option value="Special Achievement">Special Achievement</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label style={{color: '#ccc', marginBottom: '5px', display: 'block'}}>Icon</label>
                    <select
                      value={achievementIcon}
                      onChange={(e) => setAchievementIcon(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #555',
                        backgroundColor: '#2a2a2a',
                        color: '#fff'
                      }}
                    >
                      <option value="🏆">🏆 Trophy</option>
                      <option value="🥇">🥇 Gold Medal</option>
                      <option value="🥈">🥈 Silver Medal</option>
                      <option value="🥉">🥉 Bronze Medal</option>
                      <option value="👑">👑 Crown</option>
                      <option value="🏁">🏁 Checkered Flag</option>
                      <option value="⚡">⚡ Lightning</option>
                      <option value="🔥">🔥 Fire</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{marginBottom: '20px'}}>
                  <label style={{color: '#ccc', marginBottom: '10px', display: 'block', fontWeight: 'bold'}}>Drivers</label>
                  {achievementDrivers.map((driver, index) => (
                    <div key={index} style={{display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center'}}>
                      <input
                        type="text"
                        value={driver}
                        onChange={(e) => updateDriverField(index, e.target.value)}
                        placeholder="Driver name"
                        style={{
                          flex: '1',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #555',
                          backgroundColor: '#2a2a2a',
                          color: '#fff'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeDriverField(index)}
                        disabled={achievementDrivers.length === 1}
                        style={{
                          backgroundColor: achievementDrivers.length === 1 ? '#555' : '#dc3545',
                          color: 'white',
                          padding: '12px 20px',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: achievementDrivers.length === 1 ? 'not-allowed' : 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: 'bold'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addDriverField}
                    style={{
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      marginTop: '5px'
                    }}
                  >
                    + Add Driver
                  </button>
                </div>

                <div style={{display: 'flex', gap: '10px'}}>
                  <button
                    onClick={editingAchievementId ? updateAchievement : createAchievement}
                    style={{
                      backgroundColor: '#3EA822',
                      color: 'white',
                      padding: '12px 30px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      flex: editingAchievementId ? '1' : 'auto',
                      width: editingAchievementId ? 'auto' : '100%',
                      transition: 'background-color 0.3s ease'
                    }}
                  >
                    {editingAchievementId ? '✏️ Update Accomplishment' : '🏆 Create Accomplishment'}
                  </button>
                  {editingAchievementId && (
                    <button
                      onClick={cancelEditing}
                      style={{
                        backgroundColor: '#666',
                        color: 'white',
                        padding: '12px 30px',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        flex: '1',
                        transition: 'background-color 0.3s ease'
                      }}
                    >
                      ❌ Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Accomplishments List */}
              <div className="achievements-list">
                <h3 style={{color: '#3EA822', textAlign: 'center', marginBottom: '20px'}}>
                  Current Accomplishments ({achievements.length})
                </h3>
                
                {achievements.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    color: '#888',
                    padding: '60px 20px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '10px'
                  }}>
                    <div style={{fontSize: '4rem', marginBottom: '20px'}}>🏆</div>
                    <h3 style={{color: '#ccc', marginBottom: '10px'}}>No accomplishments yet</h3>
                    <p>Create your first accomplishment using the form above!</p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '20px'
                  }}>
                    {achievements.map((achievement) => (
                      <div key={achievement.id} style={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: '15px',
                        padding: '25px',
                        border: '2px solid #3EA822',
                        position: 'relative'
                      }}>
                        {/* Edit Button */}
                        <button
                          onClick={() => startEditingAchievement(achievement)}
                          style={{
                            position: 'absolute',
                            top: '10px',
                            right: '50px',
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '30px',
                            height: '30px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                          title="Edit Accomplishment"
                        >
                          ✏️
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => deleteAchievement(achievement.id, achievement.title)}
                          style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            backgroundColor: '#ff4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '30px',
                            height: '30px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                          title="Delete Accomplishment"
                        >
                          ×
                        </button>

                        {/* Homepage Toggle Button */}
                        <button
                          onClick={() => toggleHomepageStatus(achievement.id, achievement.show_on_homepage)}
                          style={{
                            position: 'absolute',
                            top: '10px',
                            right: '90px',
                            backgroundColor: achievement.show_on_homepage ? '#3EA822' : '#666',
                            color: 'white',
                            border: 'none',
                            borderRadius: '15px',
                            padding: '5px 10px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}
                          title={achievement.show_on_homepage ? 'Remove from homepage' : 'Show on homepage'}
                        >
                          {achievement.show_on_homepage ? '🏠 ON' : '🏠 OFF'}
                        </button>

                        {/* Achievement Icon */}
                        <div style={{
                          fontSize: '3rem',
                          textAlign: 'center',
                          marginBottom: '15px'
                        }}>
                          {achievement.icon}
                        </div>

                        {/* Position Badge */}
                        {achievement.position <= 3 && (
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            backgroundColor: achievement.position === 1 ? '#FFD700' : achievement.position === 2 ? '#C0C0C0' : '#CD7F32',
                            color: '#000',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            fontWeight: 'bold'
                          }}>
                            {achievement.position === 1 ? '1st' : achievement.position === 2 ? '2nd' : '3rd'}
                          </div>
                        )}

                        <h4 style={{
                          color: '#3EA822',
                          fontSize: '1.2rem',
                          textAlign: 'center',
                          marginBottom: '10px'
                        }}>
                          {achievement.title}
                        </h4>

                        <p style={{
                          color: '#ccc',
                          textAlign: 'center',
                          marginBottom: '8px',
                          fontWeight: '500'
                        }}>
                          🏁 {achievement.race_name}
                        </p>

                        {achievement.track_name && (
                          <p style={{
                            color: '#888',
                            textAlign: 'center',
                            marginBottom: '8px',
                            fontSize: '0.9rem'
                          }}>
                            📍 {achievement.track_name}
                          </p>
                        )}

                        <p style={{
                          color: '#888',
                          textAlign: 'center',
                          marginBottom: '10px',
                          fontSize: '0.9rem'
                        }}>
                          📅 {new Date(achievement.achievement_date).toLocaleDateString()}
                        </p>

                        {achievement.description && (
                          <div style={{
                            color: '#999',
                            fontSize: '0.85rem',
                            textAlign: 'center',
                            lineHeight: '1.6',
                            marginTop: '15px',
                            marginBottom: '35px'
                          }}>
                            {achievement.description.split(', ').filter((d: string) => d.trim()).map((driver: string, idx: number) => (
                              <div key={idx} style={{marginBottom: '5px'}}>
                                🏎️ {driver}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Category Badge */}
                        <div style={{
                          position: 'absolute',
                          bottom: '10px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: 'rgba(62, 168, 34, 0.2)',
                          color: '#3EA822',
                          padding: '4px 8px',
                          borderRadius: '10px',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          border: '1px solid #3EA822'
                        }}>
                          {achievement.category}
                        </div>

                        {/* Homepage Indicator */}
                        {achievement.show_on_homepage && (
                          <div style={{
                            position: 'absolute',
                            bottom: '10px',
                            right: '10px',
                            backgroundColor: '#3EA822',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '10px',
                            fontSize: '0.6rem',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            🏠 HOMEPAGE
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}