const Organization = require('../../domain/models/data/organization');

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

