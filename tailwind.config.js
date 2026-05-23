/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        accent: '#1a4fff',
        accent2: '#ff4f1a',
        ink: '#0f0f0f',
        ink2: '#3a3a3a',
        ink3: '#767676',
        surface: '#fafaf8',
        card: '#ffffff',
        border: '#e8e6e0',
        'tag-bg': '#f0f0ec',
        dark: {
          bg: '#1a1a2e',
          card: '#222240',
          border: '#2e2e50',
          muted: '#5a5a7a',
          text: '#9090b8',
          bright: '#e0e0f8',
        },
      },
    },
  },
  plugins: [],
}
