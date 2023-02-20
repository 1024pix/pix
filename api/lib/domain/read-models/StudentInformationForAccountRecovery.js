class StudentInformationForAccountRecovery {
  constructor({ firstName, lastName, username, email, latestOrganizationName } = {}) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.username = username;
    this.email = email;
    this.latestOrganizationName = latestOrganizationName;
  }
}

export default StudentInformationForAccountRecovery;
