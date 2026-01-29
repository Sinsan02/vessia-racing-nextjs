# Vessia Racing - Deployment Guide

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
   - `NODE_ENV`: `production`

### 5. Redeploy for at environment variabler skal ta effekt
```bash
vercel --prod
```

## Database

Applikasjonen bruker SQLite i utviklingsmodus og i produksjon. På serverless plattformer som Vercel vil databasen være midlertidig.

### For persistent database i produksjon
Anbefaler å bytte til en av disse:
- **PlanetScale** (MySQL-kompatibel)
- **Supabase** (PostgreSQL)
- **Railway** (PostgreSQL/MySQL)

## Første oppstart i produksjon

1. Gå til `/register` og opprett første admin-bruker
2. Bytt rolle til 'admin' i databasen manually første gang
3. Logg inn som admin og opprett ligaer

## Features

- ✅ Brukerregistrering og innlogging  
- ✅ Admin panel
- ✅ Liga management
- ✅ Poeng system
- ✅ Sjåfør management
- ✅ Profilbilder
- ✅ Responsive design