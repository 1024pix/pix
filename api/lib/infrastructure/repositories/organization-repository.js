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
  }

};
