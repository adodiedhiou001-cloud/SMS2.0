module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Désactiver toutes les règles liées aux styles inline
    '@next/next/no-css-tags': 'off',
    '@next/next/no-style-tag': 'off',
    'react/no-unknown-property': ['error', { ignore: ['style'] }],
    'react/forbid-dom-props': 'off',
    'react/no-inline-styles': 'off',
    'jsx-a11y/forbid-inline-styles': 'off',
    'react/no-unescaped-entities': 'off',
    'react/no-danger': 'off',
    
    // Désactiver les règles spécifiques qui pourraient causer des problèmes
    'no-inline-styles': 'off',
    'prefer-css-modules': 'off',
    'css-modules/no-unused-class': 'off',
    'css-modules/no-undef-class': 'off'
  },
  
  // Configuration pour ignorer certains patterns
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'build/'
  ],
  
  // Configuration des parsers et environnements
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
};
