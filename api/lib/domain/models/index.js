const path = require('path');

require('fs').readdirSync(__dirname).forEach(function(file) {
  if (file === 'index.js') return;

  const modelName = file.replace(/\..*/, '');
  module.exports[modelName] = require(path.join(__dirname, file));
});
