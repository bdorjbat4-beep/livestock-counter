/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        steppe: {
          50:  '#f0f7f0',
          100: '#d8ecd8',
          200: '#a8d4a8',
          300: '#72b872',
          400: '#4a9e4a',
          500: '#2d7d2d',
          600: '#1e5e1e',
          700: '#164616',
          800: '#0f2f0f',
          900: '#071807',
        },
        earth: {
          50:  '#faf6f0',
          100: '#f0e6d3',
          200: '#ddc9a3',
          300: '#c9a96e',
          400: '#b88a42',
          500: '#9a6e2a',
          600: '#7a541e',
          700: '#5c3e16',
          800: '#3e290e',
          900: '#201507',
        }
      }
    },
  },
  plugins: [],
}
