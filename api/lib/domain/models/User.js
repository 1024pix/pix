const _  = require('lodash');
class User {

  constructor(model = {}) {
    this.id = model.id;
    this.firstName = model.firstName;
    this.lastName = model.lastName;
    this.email = _.toLower(model.email);
    this.password = model.password;
    this.cgu = model.cgu;
    this.pixRoles = model.pixRoles || [];
  }

  get hasRolePixMaster() {
    return !!this.pixRoles.find(pixRole => pixRole.name === 'PIX_MASTER');
  }

}

module.exports = User;
