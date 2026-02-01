import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/Navbar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vessia Racing",
  description: "Professional racing team and league management",
};

export const viewport = {
  width: 'device-width',
  initialScale: 0.6,
  maximumScale: 1,
  minimumScale: 0.6,
  userScalable: true,
  viewportFit: 'cover'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-segoe bg-background-dark text-text-primary antialiased min-h-screen`}
        style={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Navbar />
        <main className="pt-20" style={{ flexGrow: 1 }}>
          {children}
        </main>
        <footer style={{
          backgroundColor: '#000000',
          color: '#ffffff',
          textAlign: 'center',
          padding: '30px 20px',
          borderTop: '2px solid #3EA822',
          marginTop: 'auto'
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
