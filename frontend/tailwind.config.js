/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@mui/**/*.{js,ts,jsx,tsx}', // utile si tu veux styliser MUI avec Tailwind
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1e40af', // exemple : bleu profond
        secondary: '#f43f5e', // exemple : rose/rouge
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // utile pour les champs MUI/formulaires
    require('@tailwindcss/typography'), // pour les contenus riches
  ],
}

  