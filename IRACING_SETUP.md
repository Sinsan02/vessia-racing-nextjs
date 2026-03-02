# iRacing Integration Setup

This guide explains how to set up iRacing OAuth integration to display driver statistics with automatic daily updates.

## Features

- **OAuth Integration**: Users login with their iRacing accounts securely
- **Automatic Sync**: Stats are fetched and cached automatically
- **No Password Storage**: Secure OAuth2 flow, no passwords stored on your server
- **Auto-updating**: Stats refresh automatically every night at 2 AM UTC

## Prerequisites

1. Registered iRacing OAuth client (see registration process below)
2. Domain/URL for your application

## OAuth Client Registration

To use iRacing's API, you must first register your application with iRacing.

### Registration Process

1. Email iRacing from your iRacing account email
2. Provide the following information:

```
Client Name: Vessia Racing
Client Type: server-side
Developer's Name: [Your Name]
Developer's URL: https://vessiaracing.com
Developer's Email: [Your iRacing Email]
Redirect URIs: https://vessiaracing.com/api/auth/iracing/callback
Audiences: data-server
```

3. Wait for approval (up to 10 days)
4. Receive your `client_id` and `client_secret`

**Important**: Keep your `client_secret` secure and never commit it to version control!

## Environment Variables

Add the following to your `.env.local` file:

```env
IRACING_CLIENT_ID=your-client-id-from-iracing
IRACING_CLIENT_SECRET=your-client-secret-from-iracing
IRACING_REDIRECT_URI=https://vessiaracing.com/api/auth/iracing/callback
CRON_SECRET=your_random_secret_for_cron_jobs
```

**Security Notes:** 
- Never commit `.env.local` to version control (already in `.gitignore`)
- Keep your client_secret secure
- Generate a random CRON_SECRET to protect the cron endpoint
- Use HTTPS in production for redirect_uri

## Vercel Environment Variables

Add the same variables to your Vercel project:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add each variable for Production, Preview, and Development:
   - `IRACING_CLIENT_ID`
   - `IRACING_CLIENT_SECRET`
   - `IRACING_REDIRECT_URI`
   - `CRON_SECRET`

## Database Setup

Run the SQL migration to add iRacing fields to the users table:

```bash
# Execute the SQL file in Supabase SQL Editor
iracing-integration-setup.sql
```

This adds:
- `iracing_customer_id` - The driver's iRacing customer ID (obtained via OAuth)
- `iracing_data` - JSON field to cache stats (iRating, safety rating, license)
- `iracing_data_updated_at` - Timestamp of last data fetch

## User Setup - OAuth Integration

### Connecting iRacing Account

Users connect their iRacing account via OAuth:

1. **Log in** to Vessia Racing website
2. **Go to Profile** page
3. **Click "Connect with iRacing"** button
4. **Login to iRacing** (redirected to iRacing.com)
5. **Authorize** Vessia Racing to access your data
6. **Done!** Redirected back with your Customer ID automatically saved

**What Happens:**
- User is redirected to iRacing's secure login page
- User logs in with their iRacing credentials (on iRacing.com, not your site)
- iRacing asks user to authorize your app
- User is redirected back with an authorization code
- Your app exchanges the code for an access token
- Your app fetches the user's Customer ID
- Customer ID is saved to the user's profile
- Stats are automatically synced

**Security:**
- ✅ No passwords are stored on your server
- ✅ Users login directly on iRacing.com
- ✅ OAuth2 standard security
- ✅ Users can revoke access anytime on iRacing.com

## Automatic Stats Updates

### Cron Job Configuration

The system automatically refreshes all drivers' stats every night at 2 AM UTC.

**Vercel Cron Setup:**
The `vercel.json` file includes:
```json
{
  "crons": [{
    "path": "/api/cron/refresh-iracing-stats",
    "schedule": "0 2 * * *"
  }]
}
```

This cron job:
- Runs daily at 2 AM UTC
- Updates all drivers who have an iRacing Customer ID
- Caches new stats in the database
- Logs success/failure for each driver

### Manual Refresh Options

**Option 1: Individual Driver (Admin UI)**
- Go to any driver's profile page (`/drivers/[userId]`)
- Click "Refresh Stats" button (admin only)

**Option 2: All Drivers (API Call)**
```bash
curl -X POST https://your-domain.com/api/cron/refresh-iracing-stats \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Removing Manual Database Updates

With self-service, admins no longer need to manually update Customer IDs. Users manage their own IDs through the profile page.

## How It Works

### User Workflow

1. **Add Customer ID**: User goes to their profile and adds iRacing Customer ID
2. **Initial Load**: Profile displays "No stats yet" until first refresh
3. **Automatic Updates**: Every night at 2 AM, stats are refreshed automatically
4. **View Stats**: User can see their current iRating, safety rating, and license on their profile

### Profile Pages

When viewing a driver profile at `/drivers/[userId]`, the page displays:
- Driver information (name, bio, profile picture)
- iRacing statistics (if configured and refreshed)
- Last updated timestamp
- Refresh button for admins to trigger immediate update

### Stat Caching

iRacing stats are cached in the database to minimize API calls:
- Stats stored in `iracing_data` field as JSON
- Updated automatically by cron job every night
- Admins can manually refresh for immediate updates
- Last update timestamp displayed on profile

### API Integration

The iRacing service (`src/lib/iracing.ts`) handles:
- Authentication with iRacing API using admin credentials
- Fetching driver statistics by Customer ID
- Session management and rate limiting

## iRacing Customer ID

To find a driver's iRacing Customer ID:

1. Log in to iRacing.com
2. Go to the driver's profile
3. The customer ID is in the URL: `https://members.iracing.com/membersite/member/CareerStats.do?custid=123456`

## Features

### User Profile Page (`/profile`)

- **Self-Service iRacing Setup**: Users can add/edit their own Customer ID
- Helpful instructions on how to find Customer ID
- No admin intervention needed

### Driver Profile Page (`/drivers/[userId]`)

- **Profile Information**: Name, experience level, bio, join date
- **iRacing Statistics Cards**:
  - iRating
  - Safety Rating (e.g., "A 4.23")
  - License Class (Rookie, D, C, B, A, Pro, Pro/WC)
- **Last Updated**: Timestamp showing when stats were last refreshed
- **Admin Controls**: Manual refresh button to update stats immediately

### Automatic Updates

- **Daily Cron Job**: Runs at 2 AM UTC to refresh all drivers
- **Smart Updates**: Only updates drivers with Customer IDs configured
- **Error Handling**: Logs failures but continues processing other drivers
- **Rate Limiting**: Adds delays between requests to avoid API throttling

### Clickable Driver Cards

On the `/drivers` page, clicking any driver card navigates to their profile page.

## API Endpoints

### `GET /api/drivers/[userId]`
Fetches a driver's profile including cached iRacing data.

### `POST /api/drivers/[userId]/iracing-stats`
Admin-only endpoint to refresh iRacing stats for a single driver.
- Authenticates with iRacing
- Fetches latest statistics
- Updates database cache

### `GET/POST /api/cron/refresh-iracing-stats`
Cron job endpoint to refresh all drivers' stats.
- Protected by CRON_SECRET authorization header
- Processes all drivers with Customer IDs
- Returns summary of successes and failures

### `PUT /api/profile/update`
Updates user profile including iRacing Customer ID.
- Any authenticated user can update their own ID
- Validates and saves Customer ID

## Troubleshooting

### "No iRacing stats available yet"
- User needs to add Customer ID in their profile
- Wait for next automatic refresh (2 AM UTC) or ask admin to manually refresh
- Check that iRacing Customer ID is valid

### "Failed to fetch iRacing stats"
- Check that `IRACING_EMAIL` and `IRACING_PASSWORD` are set correctly in environment
- Verify admin iRacing credentials are valid
- Check iRacing Customer ID is correct
- View API logs for specific error messages

### Stats Not Updating Automatically
- Verify cron job is configured in `vercel.json`
- Check Vercel deployment logs for cron execution
- Ensure `CRON_SECRET` is set in Vercel environment variables
- Manually trigger via API to test: `/api/cron/refresh-iracing-stats`

### Cron Job Not Running
- Cron jobs only work on Vercel production deployments
- Check Vercel dashboard → Project → Settings → Cron Jobs
- View execution logs in Vercel dashboard
- Test manually with curl command using CRON_SECRET

## iRacing API Documentation

For more information about the iRacing API:
- [iRacing API Documentation](https://members-ng.iracing.com/data/doc)
- Authentication uses cookie-based sessions
- Stats are fetched from member info and career stats endpoints

## Security Considerations

1. **Admin Credentials**: Store iRacing admin credentials securely in environment variables
2. **Cron Secret**: Use a strong random secret for CRON_SECRET to prevent unauthorized access
3. **User Privacy**: Users control their own Customer ID visibility
4. **Caching**: Stats are cached to minimize API calls and improve performance
5. **Rate Limiting**: Built-in delays prevent API abuse

## Deployment Instructions

### 1. Configure Environment Variables in Vercel

Go to Vercel Project Settings → Environment Variables and add:
```
IRACING_EMAIL=your_admin_iracing_email
IRACING_PASSWORD=your_admin_iracing_password
CRON_SECRET=generate_random_secret_here
```

### 2. Deploy to Production

Cron jobs only work on production deployments:
```bash
git push origin main
# Vercel will auto-deploy
```

### 3. Verify Cron Job Setup

1. Go to Vercel Dashboard → Your Project
2. Navigate to Settings → Cron Jobs
3. You should see: `/api/cron/refresh-iracing-stats` scheduled for `0 2 * * *`

### 4. Test Manual Trigger

```bash
curl -X POST https://your-domain.com/api/cron/refresh-iracing-stats \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Future Enhancements

- Historical stat tracking and graphs
- Series-specific statistics
- Recent race results display
- Achievements based on iRating milestones
- Leaderboard based on iRating
- Email notifications when stats are updated
- Admin dashboard showing all drivers' stats at a glance
