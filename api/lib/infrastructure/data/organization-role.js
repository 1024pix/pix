const Bookshelf = require('../bookshelf');

const bookshelfName = 'OrganizationRole';

module.exports = Bookshelf.model(bookshelfName, {

  tableName: 'organization-roles',
  bookshelfName,

});
