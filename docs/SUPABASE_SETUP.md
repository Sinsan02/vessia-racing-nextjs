# Supabase Setup Guide for Vessia Racing

## Steg 1: Opprett Supabase Prosjekt

1. Gå til [supabase.com](https://supabase.com)
2. Opprett en konto eller logg inn
3. Klikk "New project"
4. Velg en organisasjon
5. Skriv inn prosjektnavn: `vessia-racing`
6. Sett database passord (lagre dette!)
7. Velg region (helst nærmest deg - Europa West for Norge)
8. Klikk "Create new project"

## Steg 2: Hent konfigurasjonsdata

Når prosjektet er opprettet:

1. Gå til Settings → API
2. Kopier følgende verdier:
   - **Project URL** (URL)
   - **anon public** key
   - **service_role** key (secret - vær forsiktig!)

3. Gå til Settings → Database
4. Kopier **Connection string** og erstatt `[YOUR-PASSWORD]` med ditt database passord

## Steg 3: Oppdater .env.local

Erstatt placeholder verdiene i `.env.local` med dine ekte verdier:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database URL for PostgreSQL connection (from Supabase)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres?sslmode=require

# JWT Secret for authentication (bruk samme som Supabase JWT secret)
JWT_SECRET=your-jwt-secret-here
```

## Steg 4: Opprett database tabeller

1. Gå til din Supabase dashboard
2. Klikk på "SQL Editor" i venstre meny
3. Klikk "New query"
4. Kopier innholdet fra `supabase-schema.sql` filen
5. Klikk "Run" for å kjøre SQL-en

## Steg 5: Test forbindelsen

Kjør følgende kommandoer i terminalen:

```bash
npm run dev
```

Hvis alt er riktig konfigurert, skal appen starte uten feil og koble til Supabase databasen.

## Steg 6: Bytt til Supabase klienten (valgfritt)

Hvis du vil bruke Supabase sin JavaScript klient i stedet for direkte PostgreSQL:

1. Importer fra `src/lib/database-hybrid.ts` i stedet for `src/lib/database.ts`
2. Bruk `supabaseQuery` hjelpefunksjonene for enklere database operasjoner

## Sikkerhetstips

1. **Aldri** kommit service role key til git
2. Bruk anon key kun for klient-side operasjoner
3. Service role key skal kun brukes på server-siden
4. Aktiver Row Level Security (RLS) i produksjon
5. Konfigurer riktige RLS policies for din app

## Feilsøking

### "Invalid API key" error
- Sjekk at URL og nøkler er riktig kopiert
- Ingen ekstra mellomrom eller tegn

### "Connection refused" error  
- Sjekk DATABASE_URL format
- Sørg for at passordet er riktig i connection string
- Prøv å koble til direkte fra Supabase dashboard først

### "Table does not exist" error
- Kjør `supabase-schema.sql` i SQL Editor
- Sjekk at tabellene er opprettet under `public` schema

## Database Migration

Hvis du har eksisterende data, kan du:

1. Eksportere data fra nåværende database
2. Importere til Supabase via dashboard eller SQL
3. Oppdatere applikasjonen til å bruke Supabase

## Produksjon

For produksjon, husk å:

1. Sett alle environment variabler i Vercel/hosting provider
2. Konfigurer RLS policies
3. Sett opp backup rutiner
4. Monitorere database ytelse