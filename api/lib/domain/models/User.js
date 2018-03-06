const _ = require('lodash');

class User {

  constructor(model = {}) {
    // properties
    this.id = model.id;
    this.firstName = model.firstName;
    this.lastName = model.lastName;
    this.email = _.toLower(model.email);
    this.password = model.password;
    this.cgu = model.cgu;
  }
}

module.exports = User;
