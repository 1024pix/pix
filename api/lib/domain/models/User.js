const _ = require('lodash');

class User {

  constructor({
    id,
    // attributes
    cgu,
    pixOrgaTermsOfServiceAccepted,
    email,
    firstName,
    lastName,
    password,
    // includes
    memberships = [],
    pixRoles = [],
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = _.toLower(email);
    this.password = password;
    this.cgu = cgu;
    this.pixOrgaTermsOfServiceAccepted = pixOrgaTermsOfServiceAccepted;
    // includes
    this.pixRoles = pixRoles;
    this.memberships = memberships; // FIXME delete
    // references
  }

  get hasRolePixMaster() {
    return !!this.pixRoles.find((pixRole) => pixRole.name === 'PIX_MASTER');
  }

  // FIXME mote to MembershipRepository
  isLinkedToOrganizations() {
    return this.memberships.length > 0;
  }

}

module.exports = User;
