const config = require('../testem.js');

module.exports = { ...config, src_files: ['*.js', '*.gjs'] };
