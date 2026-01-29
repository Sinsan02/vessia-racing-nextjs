import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3EA822',
        secondary: '#5CB93A',
        accent: '#7FD847',
        dark: '#0d0d0d',
        'dark-lighter': '#1a1a1a',
        'dark-card': '#262626',
        'gray-dark': '#404040',
        'gray-light': '#cccccc',
        'success': '#22c55e',
        'info': '#3b82f6',
        background: '#0a0a0a',
        foreground: '#ffffff',
      },
      fontFamily: {
        'segoe': ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config