class OrganizationLearnerPasswordResetDTO {
  constructor({ division, lastName, firstName, username, password }) {
    this.division = division;
    this.lastName = lastName;
    this.firstName = firstName;
    this.password = password;
    this.username = username;
  }
}

export { OrganizationLearnerPasswordResetDTO };
