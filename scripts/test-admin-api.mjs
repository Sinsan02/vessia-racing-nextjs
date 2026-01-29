import fetch from 'node-fetch';

// Test admin API with fresh token
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoic2luZHJlLmJyZW5kZW1vQG91dGxvb2suY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY5Njk2NTc0LCJleHAiOjE3Njk3ODI5NzR9.3laZ79hSObPo29KP63xwVpjGeeAW86sEMm-KB0mOPfM';

async function testAdminAPI() {
  try {
    console.log('🧪 Testing Admin API...');
    
    // Test users API
    const usersResponse = await fetch('http://localhost:3000/api/admin/users', {
      headers: {
        'Cookie': `authToken=${testToken}`
      }
    });
    
    console.log('\n📋 Users API Response:');
    console.log('Status:', usersResponse.status);
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('✅ Success! Found', usersData.users ? usersData.users.length : 0, 'users');
      if (usersData.users) {
        usersData.users.forEach(user => {
          console.log(`- ${user.full_name || user.name} (${user.email}) - Role: ${user.role}, Driver: ${user.is_driver ? 'Yes' : 'No'}`);
        });
      }
    } else {
      const error = await usersResponse.text();
      console.log('❌ Failed:', error);
    }
    
    // Test leagues API  
    const leaguesResponse = await fetch('http://localhost:3000/api/leagues', {
      headers: {
        'Cookie': `authToken=${testToken}`
      }
    });
    
    console.log('\n🏆 Leagues API Response:');
    console.log('Status:', leaguesResponse.status);
    
    if (leaguesResponse.ok) {
      const leaguesData = await leaguesResponse.json();
      console.log('✅ Success! Found', leaguesData.leagues ? leaguesData.leagues.length : 0, 'leagues');
      if (leaguesData.leagues) {
        leaguesData.leagues.forEach(league => {
          console.log(`- ${league.name}: ${league.description}`);
        });
      }
    } else {
      const error = await leaguesResponse.text();
      console.log('❌ Failed:', error);
    }
    
  } catch (error) {
    console.error('💥 Test Error:', error.message);
  }
}

testAdminAPI();