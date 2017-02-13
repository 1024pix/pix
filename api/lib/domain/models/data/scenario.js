const Bookshelf = require('../../../infrastructure/bookshelf');
Bookshelf.plugin('registry');

module.exports = Bookshelf.model('Scenario', {

  tableName: 'scenarios',

});
