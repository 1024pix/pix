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
    organizationLearners,
    authenticationMethods,
    createdAt,
    updatedAt,
    lang,
    locale,
    lastTermsOfServiceValidatedAt,
    lastPixOrgaTermsOfServiceValidatedAt,
    lastPixCertifTermsOfServiceValidatedAt,
    lastLoggedAt,
    emailConfirmedAt,
    userLogin,
    hasBeenAnonymised,
    anonymisedByFirstName,
    anonymisedByLastName,
  } = {}) {
    this.id = id;
    this.cgu = cgu;
    this.firstName = firstName;
    this.lastName = lastName;
    this.username = username;
    this.email = email;
    this.pixOrgaTermsOfServiceAccepted = pixOrgaTermsOfServiceAccepted;
    this.pixCertifTermsOfServiceAccepted = pixCertifTermsOfServiceAccepted;
    this.organizationLearners = organizationLearners;
    this.authenticationMethods = authenticationMethods;
    this.createdAt = createdAt;
    this.lang = lang;
    this.locale = locale;
    this.lastTermsOfServiceValidatedAt = lastTermsOfServiceValidatedAt;
    this.lastPixOrgaTermsOfServiceValidatedAt = lastPixOrgaTermsOfServiceValidatedAt;
    this.lastPixCertifTermsOfServiceValidatedAt = lastPixCertifTermsOfServiceValidatedAt;
    this.lastLoggedAt = lastLoggedAt;
    this.emailConfirmedAt = emailConfirmedAt;
    this.userLogin = userLogin;
    this.hasBeenAnonymised = hasBeenAnonymised;
    this.updatedAt = updatedAt;
    this.anonymisedByFirstName = anonymisedByFirstName;
    this.anonymisedByLastName = anonymisedByLastName;
  }

  get anonymisedByFullName() {
    return this.anonymisedByFirstName && this.anonymisedByLastName
      ? `${this.anonymisedByFirstName} ${this.anonymisedByLastName}`
      : null;
  }
}

module.exports = UserDetailsForAdmin;
