class Organization {

  constructor({
    id,
    // attributes
    code,
    email,
    name,
    type,
    // includes
    user,
    targetProfileShared = [],
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.code = code;
    this.name = name;
    this.type = type;
    this.email = email;
    // includes
    this.user = user;
    this.targetProfileShared = targetProfileShared;
    // references
  }
}

module.exports = Organization;
