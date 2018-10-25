class Organization {

  constructor({
    id,
    // attributes
    code,
    name,
    type,
    // includes
    user,
    members = [],
    targetProfileShares = [],
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.code = code;
    this.name = name;
    this.type = type;
    // includes
    this.user = user;
    this.members = members;
    this.targetProfileShares = targetProfileShares;
    // references
  }
}

module.exports = Organization;
