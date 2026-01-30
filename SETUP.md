# Vessia Racing Setup Guide

## 1. Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm
- Supabase account (free tier is sufficient)

## 2. Clone and Install

```bash
git clone https://github.com/yourusername/vessia-racing-nextjs.git
cd vessia-racing-nextjs
npm install
```

## 3. Supabase Setup

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be ready

### Database Schema
1. Go to your Supabase dashboard → SQL Editor
2. Copy the entire content from `supabase-schema.sql` 
3. Paste and run it in the SQL Editor
4. This will create all necessary tables, indexes, and policies

### Storage Setup
1. Go to Storage → Buckets
2. Create a new bucket named `profile-pictures`
3. Make it public (for profile picture access)
4. Set up the following policies for the bucket:
   - Anyone can view files
   - Authenticated users can upload files
   - Users can update their own files

### Get API Keys
1. Go to Settings → API
2. Copy the following:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - Anon/public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)  
   - Service role key (SUPABASE_SERVICE_ROLE_KEY) - keep this secret!

## 4. Environment Configuration

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-strong-random-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 5. Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 6. First Admin User

1. Register a new user through the web interface
2. Go to your Supabase dashboard → Table Editor → users
3. Find your user and change the `role` field from `user` to `admin`
4. Now you can access the admin panel at `/admin`

## 7. Testing the Application

### User Features
- Register/Login
- Update profile (name, bio, experience level)
- Upload profile picture
- View drivers list

### Admin Features
- Create/delete leagues
- Add/remove drivers from leagues
- Update driver points
- Manage user roles

## 8. Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import the project in Vercel
3. Set environment variables in Vercel settings
4. Deploy!

### Other Platforms
The application is a standard Next.js app and can be deployed on:
- Netlify
- Railway
- Docker containers
- Any Node.js hosting platform

## Troubleshooting

### Common Issues

**"Failed to fetch" errors**
- Check if your Supabase URL and keys are correct
- Make sure your Supabase project is running
- Check browser console for detailed error messages

**Authentication not working**
- Verify JWT_SECRET is set
- Check if user exists in Supabase users table
- Look at network tab for API response errors

**Profile pictures not loading**
- Make sure the profile-pictures bucket exists
- Check bucket policies allow public read access
- Verify the bucket is set to public

**Admin features not working**
- Make sure your user has role='admin' in the database
- Check browser console for authorization errors

### Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Look at the Supabase dashboard logs
3. Check this repository's Issues tab
4. Make sure you're running the latest version

## Database Schema Overview

The application uses these main tables:
- `users` - User accounts and profiles
- `leagues` - Racing leagues 
- `driver_points` - Points tracking for drivers in leagues
- `points_history` - Audit trail of points changes

Row Level Security (RLS) is enabled with policies that:
- Allow users to read/update their own profile
- Allow public read access to leagues and points
- Use service role for admin operations