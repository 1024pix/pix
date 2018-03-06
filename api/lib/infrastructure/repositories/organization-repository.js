const { NotFoundError } = require('../../domain/errors');
const BookshelfOrganization = require('../data/organization');

module.exports = {

  // TODO return domain object
  saveFromModel(organizationModel) {
    return organizationModel.save();
  },

  isCodeAvailable(code) {
    return BookshelfOrganization
      .where({ code })
      .fetch()
      .then(organizations => {

        if (organizations) {
          return Promise.reject();
        }

        return Promise.resolve(code);
      });
  },

  isOrganizationIdExist(id) {
    return BookshelfOrganization
      .where({ id })
      .fetch()
      .then(organizations => !!organizations);
  },

  get(id) {
    return BookshelfOrganization
      .where({ id })
      .fetch({ require: true })
      .then(organization => organization.toDomainEntity())
      .catch(err => {
        if (err instanceof BookshelfOrganization.NotFoundError) {
          throw new NotFoundError(`Not found organization for ID ${id}`);
        }
      });
  },

  findBy(filters) {
    return BookshelfOrganization
      .where(filters)
      .fetchAll()
      .then(organizations => organizations.models.map((organization) => organization.toDomainEntity()));
  },

  // TODO return domain object
  getByUserId(userId) {
    return BookshelfOrganization
      .where({ userId })
      .fetchAll()
      .then(organizations => organizations.models);
  }
};

