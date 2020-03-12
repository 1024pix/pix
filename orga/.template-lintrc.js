'use strict';

module.exports = {
  extends: 'octane',

  rules: {
    'no-nested-interactive': false,
    'no-outlet-outside-routes': false,
    'no-inline-styles': {
      allowDynamicStyles: true
    }
  }
};
