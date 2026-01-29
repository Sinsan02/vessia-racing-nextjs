import fetch from 'node-fetch';

const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoic2luZHJlLmJyZW5kZW1vQG91dGxvb2suY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY5NjkxNDkxLCJleHAiOjE3Njk3Nzc4OTF9.Z1pBoLdQPQSp-nbA8_tMIUKH6MFOiHQcbTiJbyOojRI';

async function testAPI() {
  try {
    // Test 1: Create League
    console.log('Testing league creation...');
    const leagueResponse = await fetch('http://localhost:3000/api/leagues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `authToken=${testToken}`
      },
      body: JSON.stringify({
        name: 'Test League API',
        description: 'Testing league creation via API'
      })
    });
    
    const leagueResult = await leagueResponse.json();
    console.log('League creation result:', leagueResult);
    
    // Test 2: List Users (for admin panel)
    console.log('\nTesting admin user listing...');
    const usersResponse = await fetch('http://localhost:3000/api/admin/users', {
      headers: {
        'Cookie': `authToken=${testToken}`
      }
    });
    
    const usersResult = await usersResponse.json();
    console.log('Users list result:', usersResult);
    
    // Test 3: Test driver promotion (if we find a non-driver user)
    if (usersResult.success && usersResult.users.length > 0) {
      const nonDriverUser = usersResult.users.find(u => !u.is_driver);
      if (nonDriverUser) {
        console.log(`\nTesting driver promotion for user ${nonDriverUser.id}...`);
        const promotionResponse = await fetch(`http://localhost:3000/api/admin/users/${nonDriverUser.id}/driver`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `authToken=${testToken}`
          },
          body: JSON.stringify({
            isDriver: true
          })
        });
        
        const promotionResult = await promotionResponse.json();
        console.log('Driver promotion result:', promotionResult);
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAPI();