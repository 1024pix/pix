class UserDetailsForAdmin {

  constructor({
    id,
    cgu,
    username,
    firstName,
    lastName,
    email,
    pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted,
    schoolingRegistrations,
    authenticationMethods,
  } = {}) {
    this.id = id;
    this.cgu = cgu;
    this.firstName = firstName;
    this.lastName = lastName;
    this.username = username;
    this.email = email;
    this.pixOrgaTermsOfServiceAccepted = pixOrgaTermsOfServiceAccepted;
    this.pixCertifTermsOfServiceAccepted = pixCertifTermsOfServiceAccepted;
    this.schoolingRegistrations = schoolingRegistrations;
    this.authenticationMethods = authenticationMethods;
  }
}

module.exports = UserDetailsForAdmin;
