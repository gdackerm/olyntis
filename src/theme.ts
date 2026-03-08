import { createTheme, type MantineColorsTuple } from '@mantine/core';

const forest: MantineColorsTuple = [
  '#f0f5f3',
  '#dde8e3',
  '#b5cfc5',
  '#8bb5a5',
  '#6a9f8a',
  '#538f79',
  '#2C4A3E', // index 6 — primary anchor
  '#264136',
  '#1f372e',
  '#172d24',
];

const sage: MantineColorsTuple = [
  '#f2f8f6',
  '#e2efeb',
  '#c5dfd6',
  '#a8c5bd', // used as sage-light
  '#7BA898', // index 4 — brand sage
  '#6a9886',
  '#5a8674',
  '#4d7464',
  '#406255',
  '#335046',
];

const stone: MantineColorsTuple = [
  '#fdfcfa',
  '#f7f4ef',
  '#E8E3DC', // index 2 — brand stone
  '#d8d1c6',
  '#C8C0B4', // stone-mid
  '#b0a899',
  '#8A8278', // stone-dark
  '#6e675e',
  '#524d46',
  '#38342f',
];

const amber: MantineColorsTuple = [
  '#fef5ec',
  '#fce8d4',
  '#f5c9a0',
  '#eda86a',
  '#D4823A', // index 4 — brand amber
  '#c07230',
  '#a86128',
  '#8e5121',
  '#74421b',
  '#5a3315',
];

const risk: MantineColorsTuple = [
  '#fcf0f0',
  '#f7dada',
  '#eab3b3',
  '#dc8a8a',
  '#C05555', // index 4 — brand risk-red
  '#a84949',
  '#903e3e',
  '#783434',
  '#602a2a',
  '#482020',
];

export const theme = createTheme({
  primaryColor: 'forest',
  colors: {
    forest,
    sage,
    stone,
    amber,
    risk,
  },
  fontFamily: '"DM Sans", sans-serif',
  headings: {
    fontFamily: '"Lora", serif',
    sizes: {
      h1: { fontSize: '1.5rem', fontWeight: '600', lineHeight: '1.4' },
      h2: { fontSize: '1.25rem', fontWeight: '500', lineHeight: '1.4' },
      h3: { fontSize: '1.125rem', fontWeight: '500', lineHeight: '1.5' },
      h4: { fontSize: '1rem', fontWeight: '500', lineHeight: '1.5' },
    },
  },
  fontSizes: {
    xs: '0.6875rem',
    sm: '0.8125rem',
    md: '0.875rem',
    lg: '1rem',
    xl: '1.125rem',
  },
  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '18px',
    xl: '24px',
  },
  shadows: {
    xs: '0 1px 2px rgba(42,38,34,0.04)',
    sm: '0 1px 3px rgba(42,38,34,0.06), 0 1px 2px rgba(42,38,34,0.04)',
    md: '0 4px 16px rgba(42,38,34,0.08), 0 2px 6px rgba(42,38,34,0.05)',
    lg: '0 12px 40px rgba(42,38,34,0.12), 0 4px 12px rgba(42,38,34,0.06)',
    xl: '0 20px 60px rgba(42,38,34,0.16), 0 8px 20px rgba(42,38,34,0.08)',
  },
  other: {
    aiGlow: '#6DB5A0',
    aiSoft: 'rgba(109, 181, 160, 0.12)',
    charcoal: '#2A2622',
    ink: '#3D3830',
    cream: '#F7F4EF',
    warmWhite: '#FDFCFA',
  },
});
