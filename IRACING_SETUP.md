# iRacing Integration Setup

This guide explains how to set up iRacing API integration to display driver statistics on profile pages.

## Prerequisites

1. An iRacing account with valid credentials
2. Drivers must have their iRacing Customer ID added to their profile

## Environment Variables

Add the following to your `.env.local` file:

```env
IRACING_EMAIL=your_iracing_email@example.com
IRACING_PASSWORD=your_iracing_password
```

**Security Note:** Keep these credentials secure. Never commit them to version control.

## Database Setup

Run the SQL migration to add iRacing fields to the users table:

```bash
# Execute the SQL file in Supabase SQL Editor
iracing-integration-setup.sql
```

This adds:
- `iracing_customer_id` - The driver's iRacing customer ID
- `iracing_data` - JSON field to cache stats (iRating, safety rating, license)
- `iracing_data_updated_at` - Timestamp of last data fetch

## Adding iRacing Customer ID to Drivers

### Option 1: Manual Database Update

In Supabase SQL Editor:
```sql
UPDATE public.users 
SET iracing_customer_id = '123456' 
WHERE id = 1;
```

### Option 2: Future Admin Panel Feature

The admin panel can be extended to allow editing iRacing Customer IDs through the UI.

## How It Works

1. **Profile Pages**: When viewing a driver profile at `/drivers/[userId]`, the page displays:
   - Driver information (name, bio, profile picture)
   - iRacing statistics (if configured)
   - Refresh button for admins to update stats

2. **Stat Caching**: iRacing stats are cached in the database to minimize API calls:
   - Stats are stored in `iracing_data` field as JSON
   - Admins can manually refresh stats using the "Refresh Stats" button
   - Last update time is displayed

3. **API Integration**: The iRacing service (`src/lib/iracing.ts`) handles:
   - Authentication with iRacing API
   - Fetching driver statistics
   - Session management

## iRacing Customer ID

To find a driver's iRacing Customer ID:

1. Log in to iRacing.com
2. Go to the driver's profile
3. The customer ID is in the URL: `https://members.iracing.com/membersite/member/CareerStats.do?custid=123456`

## Features

### Driver Profile Page (`/drivers/[userId]`)

- **Profile Information**: Name, experience level, bio, join date
- **iRacing Statistics Cards**:
  - iRating
  - Safety Rating (e.g., "A 4.23")
  - License Class (Rookie, D, C, B, A, Pro, Pro/WC)
- **Admin Controls**: Refresh button to update stats from iRacing

### Clickable Driver Cards

On the `/drivers` page, clicking any driver card navigates to their profile page.

## API Endpoints

### `GET /api/drivers/[userId]`
Fetches a driver's profile including cached iRacing data.

### `POST /api/drivers/[userId]/iracing-stats`
Admin-only endpoint to refresh iRacing stats from the API.
- Authenticates with iRacing
- Fetches latest statistics
- Updates database cache

## Troubleshooting

### "No iRacing Customer ID configured"
- The driver doesn't have an `iracing_customer_id` set in the database
- Add it manually or through admin panel

### "Failed to fetch iRacing stats"
- Check that `IRACING_EMAIL` and `IRACING_PASSWORD` are set correctly
- Verify iRacing credentials are valid
- Check iRacing Customer ID is correct

### Stats Not Updating
- Stats are cached to reduce API load
- Admins must click "Refresh Stats" to update
- Check browser console for any errors

## iRacing API Documentation

For more information about the iRacing API:
- [iRacing API Documentation](https://members-ng.iracing.com/data/doc)
- Authentication uses cookie-based sessions
- Stats are fetched from member info and career stats endpoints

## Security Considerations

1. **Credentials**: Store iRacing credentials securely in environment variables
2. **Admin-Only**: Only admins can trigger stat refreshes to prevent API abuse
3. **Caching**: Stats are cached to minimize API calls and improve performance
4. **Rate Limiting**: Consider implementing rate limiting for stat refresh requests

## Future Enhancements

- Auto-refresh stats on a schedule (e.g., daily cron job)
- Admin UI for managing driver iRacing IDs
- Historical stat tracking
- Series-specific statistics
- Recent race results display
