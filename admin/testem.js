const config = require('../testem.js');

if (typeof module !== 'undefined') {
  module.exports = { ...config, src_files: ['*.js', '*.gjs'] };
}
