import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#1B4332',
          50: '#E8F5EE',
          100: '#C6E6D4',
          200: '#8ECFAA',
          300: '#56B87F',
          400: '#2E8B57',
          500: '#1B4332',
          600: '#163828',
          700: '#112C1F',
          800: '#0B2015',
          900: '#06140C',
        },
        amber: {
          DEFAULT: '#D4A017',
          50: '#FDF8E8',
          100: '#FAEFC4',
          200: '#F4D96D',
          300: '#EFC332',
          400: '#D4A017',
          500: '#B08512',
          600: '#8C6A0E',
          700: '#685009',
          800: '#443505',
          900: '#201A02',
        },
        cream: {
          DEFAULT: '#FAFAF5',
          50: '#FFFFFF',
          100: '#FAFAF5',
          200: '#F0F0E6',
          300: '#E6E6D7',
          400: '#DCDCC8',
          500: '#C8C8B0',
        },
      },
      fontFamily: {
        fraunces: ['var(--font-fraunces)', 'Georgia', 'serif'],
        serif: ['var(--font-source-serif)', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

export default config
