const Organization = require('../../domain/models/data/organization');
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

        if(organizations) {
          return Promise.reject();
        }

        return Promise.resolve(code);
      });
  },

  isOrganizationIdExist(id) {
    return Organization
      .where({ id })
      .fetch()
      .then(organizations => {
        if(!organizations) {
          return Promise.reject(new NotFoundError('l’organisation n’existe pas'));
        }
        return Promise.resolve(true);
      });
  },

  get(id) {
    return Organization
      .where({ id: id })
      .fetch({ require: true });
  },

  getByUserId(userId) {
    return Organization
      .where({ userId })
      .fetchAll()
      .then((organizations) => {
        return organizations.models;
      });
  }
};

