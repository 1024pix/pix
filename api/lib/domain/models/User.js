const _ = require('lodash');

class User {

  constructor({
    id,
    // attributes
    cgu,
    email,
    firstName,
    lastName,
    password,
    // embedded
    organizationsAccesses = [],
    pixRoles = [],
    // relations
  } = {}) {
    this.id = id;
    // attributes
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = _.toLower(email);
    this.password = password;
    this.cgu = cgu;
    // embedded
    this.pixRoles = pixRoles;
    this.organizationsAccesses = organizationsAccesses;
    // relations
  }

  get hasRolePixMaster() {
    return !!this.pixRoles.find(pixRole => pixRole.name === 'PIX_MASTER');
  }

  isLinkedToOrganizations() {
    return this.organizationsAccesses.length > 0;
  }

}

module.exports = User;
