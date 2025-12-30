/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#2196f3',
          600: '#1e88e5',
          700: '#1976d2',
          800: '#1565c0',
          900: '#0d47a1',
        },
        danger: {
          50: '#ffebee',
          100: '#ffcdd2',
          500: '#f44336',
          700: '#d32f2f',
        },
        warning: {
          50: '#fff3e0',
          100: '#ffe0b2',
          500: '#ff9800',
          700: '#f57c00',
        },
        success: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          500: '#4caf50',
          700: '#388e3c',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
