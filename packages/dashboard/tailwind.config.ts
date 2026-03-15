import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(220 13% 91%)',
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(224 71% 4%)',
        muted: {
          DEFAULT: 'hsl(220 14% 96%)',
          foreground: 'hsl(220 9% 46%)',
        },
        accent: {
          DEFAULT: 'hsl(220 14% 96%)',
          foreground: 'hsl(224 71% 4%)',
        },
      },
    },
  },
  plugins: [],
};

export default config;
