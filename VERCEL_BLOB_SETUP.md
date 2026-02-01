# 📝 Vercel Blob Setup for File Uploads

For at fileopplasting skal fungere på Vercel, må du sette opp Vercel Blob storage.

## 🔧 Setup Instructions:

### 1. **Gå til Vercel Dashboard**
- Logg inn på [vercel.com](https://vercel.com)
- Velg ditt prosjekt (vessia-racing-nextjs)

### 2. **Aktiver Blob Storage**
- Gå til **Storage** tab i prosjektet
- Klikk **Create Database**
- Velg **Blob** 
- Klikk **Continue**

### 3. **Kopier Environment Variables**
- Etter opprettelse, kopier `BLOB_READ_WRITE_TOKEN`
- Gå til **Settings** → **Environment Variables**
- Legg til variabelen:
  - **Name**: `BLOB_READ_WRITE_TOKEN`
  - **Value**: [din token fra blob storage]
  - **Environment**: Production, Preview, Development

### 4. **Redeploy**
- Gå til **Deployments** tab
- Klikk på den nyeste deploymenten
- Klikk **Redeploy** knappen

## ✅ Test Upload

Etter redeployment kan du teste:
1. Gå til `/events` siden som admin
2. Klikk "Create New Event"
3. Last opp et bilde
4. Bildet skal nå lagres i Vercel Blob storage

## 🔒 Sikkerhet

- Vercel Blob har automatisk CDN
- Filer er offentlig tilgjengelige via URL
- Maksimum filstørrelse: 5MB
- Kun bildefiler tillatt

## 💰 Kostnad

- Gratis tier: 5GB storage + 500 requests/måned
- Overskridelse: $0.15/GB + $0.50/1000 requests