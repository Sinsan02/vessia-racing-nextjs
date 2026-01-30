# Vessia Racing League Management System

A comprehensive racing league management platform built with Next.js 15 and Supabase.

## Features

- **User Management**: Registration, authentication, and user profiles with image upload
- **League System**: Create and manage racing leagues 
- **Driver Points**: Track driver performance across leagues
- **Admin Panel**: Administrative controls for league and user management
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Real-time Updates**: Live data synchronization with Supabase

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Authentication**: JWT with bcrypt password hashing
- **File Storage**: Supabase Storage for profile pictures

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account

### Environment Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/vessia-racing-nextjs.git
cd vessia-racing-nextjs
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file in the root directory:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up Supabase database
- Create a new Supabase project
- Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
- Set up Storage bucket named "profile-pictures" for image uploads

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── drivers/      # Driver management
│   │   ├── leagues/      # League management
│   │   └── profile/      # User profile endpoints
│   ├── admin/            # Admin dashboard
│   ├── drivers/          # Drivers page
│   ├── login/            # Authentication pages
│   └── profile/          # User profile page
├── components/           # React components
├── lib/                 # Utility libraries
│   ├── supabase.ts     # Supabase client configuration
│   └── auth.ts         # Authentication helpers
└── types/              # TypeScript type definitions
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Drivers
- `GET /api/drivers` - Get all drivers

### Leagues
- `GET /api/leagues` - Get all leagues
- `POST /api/leagues` - Create new league (admin)
- `DELETE /api/leagues/[id]` - Delete league (admin)
- `GET /api/leagues/[id]/drivers` - Get league drivers
- `POST/DELETE /api/leagues/[id]/drivers/[driverId]` - Manage league drivers
- `PUT /api/leagues/[id]/points/[driverId]` - Update driver points

### Profile
- `PUT /api/profile/update` - Update user profile
- `POST /api/profile/upload-image` - Upload profile picture

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables in Vercel dashboard
4. Deploy

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
