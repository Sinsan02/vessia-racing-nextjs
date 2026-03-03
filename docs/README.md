# Documentation & Setup Files

This folder contains all setup documentation and database schema files for the Vessia Racing project.

## 📄 Documentation Files

- **SETUP.md** - Main setup guide for the project
- **SUPABASE_SETUP.md** - Supabase configuration and setup instructions
- **IRACING_SETUP.md** - iRacing OAuth integration guide
- **IRACING_OAUTH_NOTES.md** - Technical notes on iRacing OAuth implementation

## 🗄️ Database Schema Files

- **database-setup.sql** - Main database tables and structure
- **supabase-schema.sql** - Complete Supabase schema
- **achievements-setup.sql** - Achievements/accomplishments table setup
- **drivers-order-setup.sql** - Driver ordering configuration
- **gallery-setup.sql** - Gallery/media management tables
- **gallery-categories-setup.sql** - Gallery category structure
- **iracing-integration-setup.sql** - iRacing OAuth integration tables

## 📋 Usage

1. Start with **SETUP.md** for initial project setup
2. Follow **SUPABASE_SETUP.md** to configure your database
3. Run SQL files in order:
   - `database-setup.sql` (core tables)
   - `supabase-schema.sql` (complete schema)
   - Other setup files as needed
4. For iRacing integration, see **IRACING_SETUP.md**

## 🔧 Quick Database Setup

```bash
# Run all SQL files in Supabase SQL Editor
# Or use the Supabase CLI:
supabase db reset
```

For detailed instructions, refer to the individual documentation files.
