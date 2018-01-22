module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  plugins: [
    'ember',
    'mocha'
  ],
  extends: [
    '../.eslintrc',
    'plugin:ember/recommended'
  ],
  env: {
    browser: true,
  },
  rules: {
    // FIXME reactivate the rules below
    'ember/no-on-calls-in-components': 0,
    'ember/closure-actions': 0,
    'ember/routes-segments-snake-case': 0,
    'ember/avoid-leaking-state-in-ember-objects': 0
  },
  globals: {
    jsyaml: true
  },
  overrides: [
    // node files
    {
      files: [
        'testem.js',
        'ember-cli-build.js',
        'config/**/*.js'
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015
      },
      env: {
        browser: false,
        node:
          true
      }
    },

    // test files
    {
      files: ['tests/**/*.js'],
      excludedFiles: ['tests/dummy/**/*.js'],
      env: {
        embertest: true,
        mocha: true,
      },
      globals: {
        'Showdown': false,
        'server': false
      },
      rules: {
        'no-unused-expressions': 0,
        // FIXME reactivate the rules below
        'ember/no-on-calls-in-components': 0,
        'ember/closure-actions': 0
      }
    }
  ]
};
