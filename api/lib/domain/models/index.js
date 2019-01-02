const path = require('path');

require('fs').readdirSync(__dirname).forEach(function(file) {
  if (file === 'index.js') return;

  module.exports[path.basename(file, '.js')] = require(path.join(__dirname, file));
});
