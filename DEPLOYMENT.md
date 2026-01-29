# Vessia Racing - Deployment Guide

## Database Setup (PostgreSQL)

### 1. Opprett Neon Database (Anbefalt)
1. Gå til [neon.tech](https://neon.tech) og opprett en gratis konto
2. Opprett nytt prosjekt og database
3. Kopier connection string fra dashboard

### 2. Alternativ: Supabase
1. Gå til [supabase.com](https://supabase.com)
2. Opprett nytt prosjekt
3. Hent connection string fra Settings → Database

## Deployment til Vercel

### 1. Installer Vercel CLI
```bash
npm install -g vercel
```

### 2. Login til Vercel
```bash
vercel login
```

### 3. Deploy prosjektet
```bash
vercel --prod
```

### 4. Sett environment variabler i Vercel Dashboard
1. Gå til ditt prosjekt på vercel.com
2. Gå til Settings → Environment Variables
3. Legg til:
   - `JWT_SECRET`: En sikker secret key (generer en sterk nøkkel)
   - `DATABASE_URL`: Din PostgreSQL connection string
   - `NODE_ENV`: `production`

### 5. Redeploy for at environment variabler skal ta effekt
```bash
vercel --prod
```

## Database Initialization

Når du deployer første gang:
1. Databasen initialiseres automatisk ved første API-kall
2. Alternativt kan du kjøre: `npm run db:init` lokalt med production DATABASE_URL

## Første oppstart i produksjon

1. Gå til `/register` og opprett første admin-bruker
2. Første bruker som registrerer seg får automatisk admin-rolle
3. Logg inn som admin og opprett ligaer

## Features

- ✅ Brukerregistrering og innlogging  
- ✅ Admin panel
- ✅ Liga management
- ✅ Poeng system
- ✅ Sjåfør management
- ✅ Profilbilder
- ✅ Responsive design
- ✅ PostgreSQL database (produksjonsklart)