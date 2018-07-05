class Organization {

  constructor({
    id,
    // attributes
    code,
    email,
    name,
    type,
    // embedded
    user
    // relations
  } = {}) {
    this.id = id;
    // attributes
    this.code = code;
    this.name = name;
    this.type = type;
    this.email = email;
    // embedded
    this.user = user;
    // relations
  }
}

module.exports = Organization;
