module.exports = class AdminMember {
  constructor({ id, firstName, lastName, email, role }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.role = role;
  }
};
