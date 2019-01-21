const _ = require('lodash');

class User {

  constructor({
    id,
    // attributes
    cgu,
    pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted,
    email,
    firstName,
    lastName,
    password,
    samlId,
    // includes
    memberships = [],
    certificationCenterMemberships = [],
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
    this.pixCertifTermsOfServiceAccepted = pixCertifTermsOfServiceAccepted;
    this.samlId = samlId;
    // includes
    this.pixRoles = pixRoles;
    this.memberships = memberships;
    this.certificationCenterMemberships = certificationCenterMemberships;
    // references
  }

  get hasRolePixMaster() {
    return !!this.pixRoles.find((pixRole) => pixRole.name === 'PIX_MASTER');
  }

  isLinkedToOrganizations() {
    return this.memberships.length > 0;
  }

  isLinkedToCertificationCenter() {
    return this.certificationCenterMemberships.length > 0;
  }

  hasAccessToOrganization(organizationId) {
    return this.memberships
      .some((membership) => membership.organization.id === organizationId);
  }

}

module.exports = User;
