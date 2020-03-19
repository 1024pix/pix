class StudentWithUserInfo {

  constructor({
    id,
    lastName,
    firstName,
    birthdate,
    userId,
    organizationId,
    username,
    email,
    isAuthenticatedFromGAR,

  } = {}) {
    this.id = id;
    this.lastName = lastName;
    this.firstName = firstName;
    this.birthdate = birthdate;
    this.userId = userId;
    this.organizationId = organizationId;
    this.username = username;
    this.email = email;
    this.isAuthenticatedFromGAR = isAuthenticatedFromGAR;
  }
}

module.exports = StudentWithUserInfo;
