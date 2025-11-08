module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    commonjs: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
    '@typescript-eslint/no-explicit-any': 'warn'
  },
  overrides: [
    {
      files: [
        'src/main/**/*.js',
        'src/main/**/*.ts'
      ],
      env: {
        node: true,
        browser: false
      }
    },
    {
      files: [
        'src/renderer/**/*.js',
        'src/renderer/**/*.ts',
        'src/renderer/**/*.jsx',
        'src/renderer/**/*.tsx'
      ],
      env: {
        browser: true,
        node: false
      }
    }
  ]
};
