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
        console.error('iRacing credentials not configured');
        return false;
      }

      const response = await fetch(`${this.baseUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        console.error('iRacing authentication failed:', response.status);
        return false;
      }

      // Get auth cookie from response
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        this.authCookie = setCookie;
        // Set expiry to 1 hour from now
        this.authExpiry = Date.now() + (60 * 60 * 1000);
        return true;
      }

      return false;
    } catch (error) {
      console.error('iRacing authentication error:', error);
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
      const authenticated = await this.authenticate();
      if (!authenticated) {
        throw new Error('Failed to authenticate with iRacing');
      }
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        Cookie: this.authCookie || '',
      },
    });

    if (!response.ok) {
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
      // Fetch member stats
      const statsData = await this.makeRequest(`/data/member/info?cust_ids=${customerId}`);
      
      if (!statsData || !statsData.members || statsData.members.length === 0) {
        return null;
      }

      const member = statsData.members[0];

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

      return {
        irating: member.irating || 0,
        safety_rating: safetyRating,
        license_class: licenseClass,
        license_level: licenseLevel,
      };
    } catch (error) {
      console.error('Error fetching iRacing stats:', error);
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
