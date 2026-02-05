import type { Metadata } from "next";
import { Orbitron, Racing_Sans_One, Rajdhani } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/Navbar';
import MobileWarning from '@/components/MobileWarning';

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"]
});

const racingSansOne = Racing_Sans_One({
  variable: "--font-racing-sans-one",
  subsets: ["latin"],
  weight: ["400"]
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Vessia Racing",
  description: "Professional racing team and league management",
  icons: {
    icon: '/Vessia_Logo.png',
    apple: '/Vessia_Logo.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  minimumScale: 1.0,
  userScalable: false,
  viewportFit: 'cover'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/Vessia_Logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/Vessia_Logo.png" />
        <link rel="preload" as="image" href="/images/decorative/Screenshot_2025-11-23_180245.png" />
        <link rel="preload" as="image" href="/images/decorative/Screenshot_2025-10-11_170801.png" />
        <link rel="preload" as="image" href="/images/decorative/Screenshot_2025-11-15_150823.png" />
        <link rel="preload" as="image" href="/images/decorative/Screenshot_2025-05-18_205724.png" />
      </head>
      <body
        className={`${orbitron.variable} ${racingSansOne.variable} ${rajdhani.variable} font-segoe bg-background-dark text-text-primary antialiased min-h-screen`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh'
        }}
      >
        <MobileWarning />
        <Navbar />
        <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
        <footer style={{
          backgroundColor: '#0a0a0a',
          color: '#ffffff',
          textAlign: 'center',
          padding: '15px 20px',
          borderTop: '2px solid #3EA822',
          marginTop: 'auto',
          width: '100%'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <p style={{
                margin: '0',
                fontSize: '1rem',
                color: '#cccccc'
              }}>
                © 2026 VessiaRacing. All rights reserved.
              </p>
              <a
                href="https://www.instagram.com/vessiaracing"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#3EA822',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'color 0.3s ease'
                }}
                className="hover:text-[#2d7a19]"
              >
                📷 Follow us on Instagram
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
