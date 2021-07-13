class StudentInformationForAccountRecovery {
  constructor(
    {
      userId,
      firstName,
      lastName,
      username,
      email,
      latestOrganizationName,
    } = {}) {
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.username = username;
    this.email = email;
    this.latestOrganizationName = latestOrganizationName;
  }
}

module.exports = StudentInformationForAccountRecovery;
