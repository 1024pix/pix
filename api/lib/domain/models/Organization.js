class Organization {

  constructor({
    id,
    // attributes
    code,
    name,
    type,
    logoUrl,
    // includes
    user,
    targetProfileShares = [],
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.code = code;
    this.name = name;
    this.type = type;
    this.logoUrl = logoUrl;
    // includes
    this.user = user;
    this.targetProfileShares = targetProfileShares;
    // references
  }
}

module.exports = Organization;
