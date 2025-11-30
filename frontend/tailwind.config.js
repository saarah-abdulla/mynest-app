/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Exact color palette from design
        background: '#F3F1E7', // Warm Beige Background (Primary Background)
        card: '#FDFDFD', // Off-White Cards (Containers)
        sage: {
          DEFAULT: '#B4BFAB', // Light Sage Green (Primary Button / Accent)
          dark: '#879678', // Soft Olive / Muted Green (Secondary Buttons)
        },
        brown: {
          DEFAULT: '#795548', // Warm Brown (Main Headings / Text)
        },
        coral: {
          DEFAULT: '#EBA091', // Coral Peach (Heart Icon / Highlights)
        },
        // Additional colors for categories and UI elements
        orange: {
          light: '#FFE5D4',
          DEFAULT: '#FFB085',
          dark: '#FF8C5A',
        },
        green: {
          light: '#E8F5E9',
          DEFAULT: '#66BB6A',
          dark: '#4CAF50',
        },
        blue: {
          light: '#E3F2FD',
          DEFAULT: '#64B5F6',
          dark: '#42A5F5',
        },
        red: {
          light: '#FFEBEE',
          DEFAULT: '#EF5350',
        },
        purple: {
          light: '#F3E5F5',
          DEFAULT: '#BA68C8',
        },
        pink: {
          light: '#FCE4EC',
          DEFAULT: '#F48FB1',
        },
        yellow: {
          light: '#FFF9C4',
          DEFAULT: '#FFEB3B',
        },
        gray: {
          light: '#F5F5F5',
          DEFAULT: '#9E9E9E',
          dark: '#616161',
        },
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}

