class Organization {

  constructor({ id, code, name, type, email, user } = {}) {
    // properties
    this.id = id;
    this.code = code;
    this.name = name;
    this.type = type;
    this.email = email;

    // relationships
    this.user = user;
  }
}

module.exports = Organization;
