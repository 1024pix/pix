'use strict';

module.exports = {
  extends: ['octane', 'a11y'],

  rules: {
    'link-rel-noopener': false,
    'no-html-comments': false,
    'no-inline-styles': false,
    'no-negated-condition': false,
    'no-quoteless-attributes': false,
    'no-triple-curlies': false,
    'no-unused-block-params': false,
    'style-concatenation': false,
    'no-bare-strings': ['Pix', '&nbsp;', '&#8226;', '.', '*', '1024', '/', '•', '-', '%'],
  },
};
