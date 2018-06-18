const _ = require('lodash');

class User {

  constructor({
    id,
    firstName,
    lastName,
    email,
    password,
    cgu,
    pixRoles = [],
    organizationsAccesses = []
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = _.toLower(email);
    this.password = password;
    this.cgu = cgu;
    this.pixRoles = pixRoles;
    this.organizationsAccesses = organizationsAccesses;
  }

  get hasRolePixMaster() {
    return !!this.pixRoles.find(pixRole => pixRole.name === 'PIX_MASTER');
  }

  isLinkedToOrganizations() {
    return this.organizationsAccesses.length > 0;
  }

}

module.exports = User;
