/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#3B82F6', // Professional blue
          light: '#60A5FA',
          dark: '#2563EB',
        },
        secondary: {
          DEFAULT: '#1E293B', // Slate blue dark
          light: '#334155',
          dark: '#0F172A',
        },
        accent: {
          DEFAULT: '#F59E0B', // Warm amber
          light: '#FBBF24',
          dark: '#D97706',
        },
        background: {
          DEFAULT: '#F8FAFC', // Light gray-blue
          dark: '#E2E8F0',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#F1F5F9',
        },
        text: {
          primary: '#1E293B', // Dark slate blue
          secondary: '#64748B', // Medium gray
          light: '#94A3B8', // Light gray
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
};