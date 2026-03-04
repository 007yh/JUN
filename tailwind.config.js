/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '2rem',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B9D', // Warm Pink
          hover: '#FF528B',
        },
        secondary: '#C44569', // Soft Purple
        accent: '#98FB98', // Mint Green
        background: '#FFF5F5', // Cream White
      },
      boxShadow: {
        'clay-card': '8px 8px 16px rgba(166, 175, 195, 0.4), -8px -8px 16px rgba(255, 255, 255, 0.8)',
        'clay-btn': '5px 5px 10px rgba(166, 175, 195, 0.4), -5px -5px 10px rgba(255, 255, 255, 0.8)',
        'clay-inset': 'inset 5px 5px 10px rgba(166, 175, 195, 0.2), inset -5px -5px 10px rgba(255, 255, 255, 0.8)',
      },
      borderRadius: {
        'clay': '20px',
      },
      animation: {
        'scroll-vertical': 'scroll-vertical 20s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        'scroll-vertical': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        }
      }
    },
  },
  plugins: [],
};
