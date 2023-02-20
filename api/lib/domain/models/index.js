import path from 'path';

/* eslint-disable-next-line no-sync */
const dirents = require('fs').readdirSync(__dirname, { withFileTypes: true });
dirents
  .filter((dirent) => dirent.isFile())
  .forEach(function (dirent) {
    if (dirent.name === 'index.js') return;

    module.exports[path.basename(dirent.name, '.js')] = require(path.join(__dirname, dirent.name));
  });
