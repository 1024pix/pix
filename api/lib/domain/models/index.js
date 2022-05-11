const path = require('path');

/* eslint-disable-next-line no-sync */
require('fs')
  .readdirSync(__dirname)
  .forEach(function (file) {
    if (file === 'index.js') return;
    const fileExtension = path.extname(file);
    const className = path.basename(file, path.extname(file));
    module.exports[className] =
      fileExtension === '.ts' ? require(path.join(__dirname, file))[className] : require(path.join(__dirname, file));
  });
