import type { Config } from 'tailwindcss';
import { nextui } from '@nextui-org/react';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      borderColor: {
        DEFAULT: '#f2f2f2',
        dark: '#ffffff1d',
      },
      colors: {
        gray: '#b7bdc6',
        primary: '#578E7E',
      },
      screens: {
        '2xl': '1536px',
      },
    },
  },
  darkMode: 'class',
  plugins: [nextui()],
};

export default config;
