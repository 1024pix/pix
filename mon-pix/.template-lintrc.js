module.exports = {
  plugins: ['ember-template-lint-plugin-prettier'],

  extends: ['recommended', 'a11y', 'ember-template-lint-plugin-prettier:recommended'],

  rules: {
    'no-duplicate-landmark-elements': false,
    'no-redundant-role': false,
    'no-html-comments': false,
    'no-bare-strings': ['Pix', '&nbsp;', '&#8226;', '.', '*', '1024', '/', '•', '-', '%'],
    'require-valid-alt-text': false,
    'link-rel-noopener': false, // See https://github.com/ember-template-lint/ember-template-lint/issues/1883
  },

  ignore: ['blueprints/component-test/files/tests/integration/components/*'],

  overrides: [
    {
      files: ['**/integration/**/*_test.js'],
      rules: {
        prettier: false,
      },
    },
    {
      files: ['**/*.gjs'],
      rules: {
        prettier: 'off',
      },
    },
  ],
};
