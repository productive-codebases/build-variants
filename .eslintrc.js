module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    // Do not ban specific types from being used
    '@typescript-eslint/ban-types': 'off',
    // Allow any
    "@typescript-eslint/no-explicit-any": "off",
    // Don't force explicit types return
    "@typescript-eslint/explicit-module-boundary-types": "off"
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
};
