class CertificationPointOfContact {
  constructor({
    id,
    firstName,
    lastName,
    email,
    lang,
    allowedCertificationCenterAccesses,
    certificationCenterMemberships,
    pixCertifTosStatus,
  }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.lang = lang;
    this.pixCertifTermsOfServiceAccepted = pixCertifTosStatus.isAccepted;
    this.allowedCertificationCenterAccesses = allowedCertificationCenterAccesses;
    this.certificationCenterMemberships = certificationCenterMemberships;
    this.pixCertifTermsOfServiceStatus = pixCertifTosStatus.status;
    this.pixCertifTermsOfServiceDocumentPath = pixCertifTosStatus.documentPath;
    this.lastPixCertifTermsOfServiceValidatedAt = pixCertifTosStatus.acceptedAt;
  }
}

export { CertificationPointOfContact };
