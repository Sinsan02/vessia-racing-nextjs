/**
 * iRacing API Integration
 * 
 * To use this service, you need to set up iRacing API credentials:
 * 1. Get your iRacing credentials (email/password)
 * 2. Add to .env.local:
 *    IRACING_EMAIL=your_iracing_email
 *    IRACING_PASSWORD=your_iracing_password
 * 
 * Note: iRacing API uses cookie-based authentication
 */

interface IRacingAuthResponse {
  authcode?: string;
  custId?: number;
}

interface IRacingStats {
  custId: number;
  displayName: string;
  irating?: number;
  safetyRating?: string;
  licenseClass?: string;
  licenseLevel?: number;
}

class IRacingService {
  private baseUrl = 'https://members-ng.iracing.com';
  private authCookie: string | null = null;
  private authExpiry: number = 0;

  /**
   * Authenticate with iRacing API
   */
  private async authenticate(): Promise<boolean> {
    try {
      const email = process.env.IRACING_EMAIL;
      const password = process.env.IRACING_PASSWORD;

      if (!email || !password) {
        console.error('❌ iRacing credentials not configured. Please set IRACING_EMAIL and IRACING_PASSWORD environment variables.');
        return false;
      }

      console.log('🔄 Attempting iRacing authentication...');
      console.log(`📧 Using email: ${email?.substring(0, 3)}***`);
      
      // Method 1: Try /data/auth endpoint
      console.log('🔍 Trying /data/auth endpoint...');
      let response = await fetch(`${this.baseUrl}/data/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.toLowerCase(),
          password: password
        }),
      });

      console.log(`📡 /data/auth response status: ${response.status}`);

      // If that fails, try the original /auth endpoint with GET
      if (response.status === 405 || response.status === 404) {
        console.log('🔍 Trying /auth endpoint with different method...');
        
        // Create Basic Auth header
        const authString = Buffer.from(`${email}:${password}`).toString('base64');
        
        response = await fetch(`${this.baseUrl}/auth`, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${authString}`,
          },
        });
        
        console.log(`📡 /auth (GET) response status: ${response.status}`);
      }

      console.log(`📡 Final auth response status: ${response.status}`);

      if (!response.ok) {
        console.error(`❌ iRacing authentication failed with status ${response.status}`);
        const errorText = await response.text().catch(() => 'No error details');
        console.error('Error details:', errorText);
        return false;
      }

      // Get auth cookie from response headers
      const setCookieHeader = response.headers.get('set-cookie');
      console.log('🍪 Set-Cookie header:', setCookieHeader ? `Present (${setCookieHeader.substring(0, 50)}...)` : 'Missing');
      
      // Also check all headers
      const allHeaders = Array.from(response.headers.entries());
      console.log('📋 All response headers:', allHeaders.map(([k, v]) => `${k}: ${v.substring(0, 30)}...`));

      // Try to read response body
      const textBody = await response.text().catch(() => '');
      console.log('📄 Response body length:', textBody.length);
      
      if (setCookieHeader) {
        this.authCookie = setCookieHeader;
        // Set expiry to 1 hour from now
        this.authExpiry = Date.now() + (60 * 60 * 1000);
        console.log('✅ iRacing authentication successful');
        return true;
      }

      console.error('❌ No auth cookie received from iRacing');
      return false;
    } catch (error) {
      console.error('❌ iRacing authentication error:', error);
      return false;
    }
  }

  /**
   * Check if authentication is still valid
   */
  private isAuthValid(): boolean {
    return this.authCookie !== null && Date.now() < this.authExpiry;
  }

  /**
   * Make authenticated request to iRacing API
   */
  private async makeRequest(endpoint: string): Promise<any> {
    // Check if we need to authenticate
    if (!this.isAuthValid()) {
      console.log('🔑 Auth token expired or missing, re-authenticating...');
      const authenticated = await this.authenticate();
      if (!authenticated) {
        throw new Error('Failed to authenticate with iRacing API. Check credentials.');
      }
    }

    console.log(`📡 Making iRacing API request: ${endpoint}`);
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        Cookie: this.authCookie || '',
      },
    });

    console.log(`📊 API response status: ${response.status} for ${endpoint}`);

    if (!response.ok) {
      console.error(`❌ iRacing API request failed with status ${response.status}`);
      const errorBody = await response.text().catch(() => 'No error body');
      console.error('Error body:', errorBody);
      throw new Error(`iRacing API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get driver stats by customer ID
   */
  async getDriverStats(customerId: string): Promise<{
    irating: number;
    safety_rating: string;
    license_class: string;
    license_level: number;
  } | null> {
    try {
      console.log(`🔍 Fetching iRacing stats for customer ID: ${customerId}`);
      
      // Fetch member stats
      const statsData = await this.makeRequest(`/data/member/info?cust_ids=${customerId}`);
      
      if (!statsData || !statsData.members || statsData.members.length === 0) {
        console.error(`❌ No member data found for customer ID: ${customerId}`);
        return null;
      }

      const member = statsData.members[0];
      console.log(`✅ Member data retrieved for: ${member.display_name || 'Unknown'}`);

      // Fetch career stats for more detailed info
      const careerData = await this.makeRequest(`/data/stats/member_career?cust_id=${customerId}`);

      // Parse safety rating (format is "4.23" or "A 4.23")
      let safetyRating = 'N/A';
      let licenseClass = 'Rookie';
      let licenseLevel = 1;

      if (careerData && careerData.stats && careerData.stats.length > 0) {
        const roadStats = careerData.stats.find((s: any) => s.category === 'Road') || careerData.stats[0];
        
        if (roadStats.license_level !== undefined) {
          licenseLevel = roadStats.license_level;
          const licenseClasses = ['Rookie', 'D', 'C', 'B', 'A', 'Pro', 'Pro/WC'];
          licenseClass = licenseClasses[Math.min(licenseLevel, licenseClasses.length - 1)] || 'Rookie';
        }

        if (roadStats.safety_rating !== undefined) {
          safetyRating = `${licenseClass} ${roadStats.safety_rating.toFixed(2)}`;
        }
      }

      const result = {
        irating: member.irating || 0,
        safety_rating: safetyRating,
        license_class: licenseClass,
        license_level: licenseLevel,
      };

      console.log('✅ iRacing stats retrieved successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching iRacing stats:', error);
      return null;
    }
  }

  /**
   * Search for a driver by name
   */
  async searchDriver(name: string): Promise<{ custId: number; displayName: string }[]> {
    try {
      const data = await this.makeRequest(`/data/member/search?search_term=${encodeURIComponent(name)}`);
      return data.results || [];
    } catch (error) {
      console.error('Error searching iRacing driver:', error);
      return [];
    }
  }
}

// Export singleton instance
export const iRacingService = new IRacingService();
