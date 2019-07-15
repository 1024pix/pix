const roles = {
  OWNER: 'OWNER', // Is resposible for the organization, has ADMIN capabilities, there must be only one per organzation
  MEMBER: 'MEMBER',
};

class Membership {

  constructor({
    id,
    // attributes
    organizationRole = roles.MEMBER,
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

  get isOwner() {
    return this.organizationRole === roles.OWNER;
  }
}

Membership.roles = roles;

module.exports = Membership;
