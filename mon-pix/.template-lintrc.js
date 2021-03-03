'use strict';

module.exports = {
  extends: ['octane', 'a11y'],

  rules: {
    'no-duplicate-landmark-elements': false,
    'no-html-comments': false,
    'no-bare-strings': ['Pix', '&nbsp;', '&#8226;', '.', '*', '1024', '/', '•', '-', '%'],
  },
};
