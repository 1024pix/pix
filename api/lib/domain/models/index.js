const path = require('path');

/* eslint-disable-next-line no-sync */
require('fs').readdirSync(__dirname).forEach((file) => {
  if (file === 'index.js') return;

  module.exports[path.basename(file, '.js')] = require(path.join(__dirname, file));
});
