module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    commonjs: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off'
  },
  overrides: [
    {
      files: [
        'src/main.js',
        'src/electron.js',
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
