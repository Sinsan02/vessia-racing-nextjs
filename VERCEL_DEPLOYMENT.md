# 🚀 Vercel Deployment Guide

## Problemer løst:
1. **Authentication timeout**: Fjernet dobbel API kall i login
2. **Cookie issues**: Forbedret cookie innstillinger for Vercel
3. **Database timeout**: Optimalisert connection pool og lagt til timeout beskyttelse
4. **API timeout**: Økt maxDuration fra 10 til 30 sekunder

## Deployment Steps:

### 1. Environment Variables
Gå til Vercel Dashboard → Settings → Environment Variables og legg til:

```
JWT_SECRET=din-sikre-jwt-nøkkel-minimum-32-tegn
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
NODE_ENV=production
```

### 2. Database Setup
Sørg for at PostgreSQL databasen din er tilgjengelig fra internett og har SSL aktivert.

### 3. Deploy
```bash
vercel --prod
```

## 🔧 Hvis du fortsatt har problemer:

### Debug steps:
1. Sjekk Vercel logs: `vercel logs [deployment-url]`
2. Test login API direkte: `curl -X POST [your-vercel-url]/api/auth/login`
3. Kontroller environment variables i Vercel dashboard

### Common issues:
- **Database connection**: Sjekk at DATABASE_URL er korrekt og SSL er konfigurert
- **JWT_SECRET**: Må være minst 32 tegn lang i production
- **Cookie issues**: Prøv å logge inn i incognito mode for å teste

### Performance tips:
- Database connection pool er optimalisert for serverless (max 5 connections)
- API timeout økt til 30 sekunder
- Fjernet tung database initialisering på hver request

## Test Login Flow:
1. Gå til [your-vercel-url]/login
2. Logg inn med eksisterende bruker
3. Sjekk at du får "Velkommen [navn]!" melding
4. Sjekk at du blir redirectet til forsiden

Hvis login fortsatt henger, sjekk Vercel function logs for spesifikke feilmeldinger.