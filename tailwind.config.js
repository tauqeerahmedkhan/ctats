/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f3fa',
          100: '#dce2f2',
          200: '#bcc8e5',
          300: '#8fa2d4',
          400: '#627ec0',
          500: '#4362ad',
          600: '#1E3A8A', // Primary color
          700: '#1e3875',
          800: '#1e2f5c',
          900: '#1c294b',
        },
        teal: {
          50: '#f0fdfd',
          100: '#ccfcfa',
          200: '#99f6f4',
          300: '#5eebe9',
          400: '#2dd9d7',
          500: '#0D9488', // Secondary color
          600: '#0a7c72',
          700: '#0c655e',
          800: '#0d4f4b',
          900: '#0e3e3b',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#F59E0B', // Accent color
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      boxShadow: {
        card: '0 2px 8px 0 rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};