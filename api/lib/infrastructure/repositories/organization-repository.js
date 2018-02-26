const Organization = require('../data/organization');
const { NotFoundError } = require('../../domain/errors');

module.exports = {

  saveFromModel(organizationModel) {
    return organizationModel.save();
  },

  isCodeAvailable(code) {
    return Organization
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
    return Organization
      .where({ id })
      .fetch()
      .then(organizations => !!organizations);
  },

  get(id) {
    return Organization
      .where({ id })
      .fetch({ require: true })
      .then(organization => organization.toDomainEntity())
      .catch(err => {
        if (err instanceof Organization.NotFoundError) {
          throw new NotFoundError(`Not found organization for ID ${id}`);
        }
      });
  },

  findBy(filters) {
    return Organization
      .where(filters)
      .fetchAll({ withRelated: ['user'] })
      .then(organizations => organizations.models);
  },

  getByUserId(userId) {
    return Organization
      .where({ userId })
      .fetchAll()
      .then(organizations => organizations.models);
  }
};

