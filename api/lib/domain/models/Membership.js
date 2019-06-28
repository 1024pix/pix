const roles = {
  OWNER: 'OWNER', // Is resposible for the organization, has ADMIN capabilities, there must be only one per organzation
  ADMIN: 'ADMIN', // can manage members
  MEMBER: 'MEMBER',
};

class Membership {

  constructor({
    id,
    // attributes
    organizationRole = roles.OWNER,
    // includes
    organization,
    user,
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.organizationRole = organizationRole;
    // includes
    this.organization = organization;
    this.user = user;
    // references
  }
}

Membership.roles = roles;

module.exports = Membership;
