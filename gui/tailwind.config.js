module.exports = {
  mode: 'jit',
  purge: ['./packages/renderer/**/*.html', './packages/renderer/**/*.{js,jsx,ts,tsx,vue}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')({ strategy: 'class' })],
};
