class Organization {

  constructor(model = {}) {
    // properties
    this.id = model.id;
    this.code = model.code;
    this.name = model.name;
    this.type = model.type;
    this.email = model.email;

    // relationships
    this.user = model.user;
  }
}

module.exports = Organization;
