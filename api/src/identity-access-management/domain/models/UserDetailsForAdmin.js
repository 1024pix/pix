import { STATUS } from '../../../legal-documents/domain/models/LegalDocumentStatus.js';
import { getNearestSupportedLocale } from '../../../shared/domain/services/locale-service.js';

class UserDetailsForAdmin {
  constructor({
    id,
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

  set tosStatus({ pixAppTosStatus }) {
    this.cgu = pixAppTosStatus.status === STATUS.ACCEPTED || pixAppTosStatus.status === STATUS.UPDATE_REQUESTED;
    this.pixAppTermsOfServiceAccepted = pixAppTosStatus.status === STATUS.ACCEPTED;
    this.lastPixAppTermsOfServiceValidatedAt = pixAppTosStatus.acceptedAt;
  }
}

export { UserDetailsForAdmin };
