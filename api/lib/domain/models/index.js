const path = require('node:path');

/* eslint-disable-next-line no-sync */
require('node:fs')
  .readdirSync(__dirname)
  .forEach(function (file) {
    if (file === 'index.js') return;

    module.exports[path.basename(file, '.js')] = require(path.join(__dirname, file));
  });
