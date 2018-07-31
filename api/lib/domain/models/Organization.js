class Organization {

  constructor({
    id,
    // attributes
    code,
    email,
    name,
    type,
    // includes
    user
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
    this.campaigns = [];
    // references
  }
}

module.exports = Organization;
