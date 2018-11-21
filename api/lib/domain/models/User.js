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
    samlId,
    // includes
    memberships = [],
    pixRoles = [],
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email ? _.toLower(email) : null;
    this.password = password;
    this.cgu = cgu;
    this.pixOrgaTermsOfServiceAccepted = pixOrgaTermsOfServiceAccepted;
    this.samlId = samlId;
    // includes
    this.pixRoles = pixRoles;
    this.memberships = memberships;
    // references
  }

  get hasRolePixMaster() {
    return !!this.pixRoles.find((pixRole) => pixRole.name === 'PIX_MASTER');
  }

  isLinkedToOrganizations() {
    return this.memberships.length > 0;
  }

  hasAccessToOrganization(organizationId) {
    return this.memberships
      .some((membership) => membership.organization.id === organizationId);
  }

}

module.exports = User;
