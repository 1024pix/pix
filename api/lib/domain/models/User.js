const _ = require('lodash');

class User {

  constructor({ id, firstName, lastName, email, password, cgu, pixRoles = [] } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = _.toLower(email);
    this.password = password;
    this.cgu = cgu;
    this.pixRoles = pixRoles;
  }

  get hasRolePixMaster() {
    return !!this.pixRoles.find(pixRole => pixRole.name === 'PIX_MASTER');
  }

}

module.exports = User;
