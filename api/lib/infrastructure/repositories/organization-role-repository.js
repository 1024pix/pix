const { NotFoundError } = require('../../domain/errors');
const BookshelfOrganizationRole = require('../data/organization-role');
const OrganizationRole = require('../../domain/models/OrganizationRole');

function _toDomain(bookshelfOrganizationRole) {
  return new OrganizationRole({
    id: bookshelfOrganizationRole.get('id'),
    name: bookshelfOrganizationRole.get('name')
  });
}

module.exports = {

  getByName(name) {
    return BookshelfOrganizationRole
      .where({ name })
      .fetch()
      .then((bookshelfOrganizationRole) => {
        if (!bookshelfOrganizationRole) {
          throw new NotFoundError(`Not found organization role for name ${name}`);
        }
        return _toDomain(bookshelfOrganizationRole);
      });
  },
};

