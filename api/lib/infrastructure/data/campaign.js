const Bookshelf = require('../bookshelf');

require('./user');
require('./organization');

module.exports = Bookshelf.model('Campaign', {

  tableName: 'campaigns',

});
