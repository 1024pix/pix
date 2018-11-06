class UserSummary {

  constructor(
    {
      id,
      // attributes
      email,
      firstName,
      lastName,
      // includes
      // references
    } = {}) {
    this.id = id;
    // attributes
    this.email = email.toLowerCase();
    this.firstName = firstName;
    this.lastName = lastName;
    // includes
    // references
  }
}

module.exports = UserSummary;
