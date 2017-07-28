const Organization = require('../../domain/models/data/organization');

module.exports = {

  saveFromModel(organizationModel) {
    return organizationModel.save();
  },

  isCodeAvailable(code) {
    return Organization
      .where({ code })
      .fetch()
      .then(codes => {

        if(codes) {
          return Promise.reject();
        }

        return code;
      });
  }

};
