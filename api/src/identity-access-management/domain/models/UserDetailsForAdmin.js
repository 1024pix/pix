import { getNearestSupportedLocale } from '../../../shared/domain/services/locale-service.js';

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
    hasBeenAnonymisedBy,
    anonymisedByFirstName,
    anonymisedByLastName,
    isPixAgent,
    lastApplicationConnections,
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
    this.locale = getNearestSupportedLocale(locale);
    this.lastTermsOfServiceValidatedAt = lastTermsOfServiceValidatedAt;
    this.lastPixOrgaTermsOfServiceValidatedAt = lastPixOrgaTermsOfServiceValidatedAt;
    this.lastPixCertifTermsOfServiceValidatedAt = lastPixCertifTermsOfServiceValidatedAt;
    this.lastLoggedAt = lastLoggedAt;
    this.emailConfirmedAt = emailConfirmedAt;
    this.userLogin = userLogin;
    this.hasBeenAnonymised = hasBeenAnonymised;
    this.hasBeenAnonymisedBy = hasBeenAnonymisedBy;
    this.updatedAt = updatedAt;
    this.anonymisedByFirstName = anonymisedByFirstName;
    this.anonymisedByLastName = anonymisedByLastName;
    this.isPixAgent = isPixAgent;
    this.lastApplicationConnections = lastApplicationConnections;
  }

  get anonymisedByFullName() {
    return this.anonymisedByFirstName && this.anonymisedByLastName
      ? `${this.anonymisedByFirstName} ${this.anonymisedByLastName}`
      : null;
  }
}

export { UserDetailsForAdmin };
