module.exports = class AdminMember {
  constructor({ id, userId, firstName, lastName, email, role }) {
    this.id = id;
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.role = role;
  }
};
