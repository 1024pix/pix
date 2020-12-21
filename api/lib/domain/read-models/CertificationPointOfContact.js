class CertificationPointOfContact {
  constructor({
    id,
    firstName,
    lastName,
    email,
    pixCertifTermsOfServiceAccepted,
    certificationCenterId,
    certificationCenterName,
    certificationCenterType,
    certificationCenterExternalId,
    isRelatedOrganizationManagingStudents,
  }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.pixCertifTermsOfServiceAccepted = pixCertifTermsOfServiceAccepted;
    this.certificationCenterId = certificationCenterId;
    this.certificationCenterName = certificationCenterName;
    this.certificationCenterType = certificationCenterType;
    this.certificationCenterExternalId = certificationCenterExternalId;
    this.isRelatedOrganizationManagingStudents = Boolean(isRelatedOrganizationManagingStudents);
  }
}

module.exports = CertificationPointOfContact;
