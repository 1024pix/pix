class Membership {

  constructor({
    id,
    // attributes
    // includes
    organization = {},
    role = {},
    user = {},
    // references
  } = {}) {
    this.id = id;
    // attributes
    // includes
    this.organization = organization;
    this.role = role;
    this.user = user;
    // references
  }
}

module.exports = Membership;
