module.exports = {
  extends: ['react-app'],
  rules: {
    'no-unused-vars': 'warn',
    'react/prop-types': 'off'
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
};
