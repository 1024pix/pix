class CertificationPointOfContact {
  constructor({
    id,
    firstName,
    lastName,
    email,
    lang,
    allowedCertificationCenterAccesses,
    certificationCenterMemberships,
    pixCertifTosStatusDTO,
  }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.lang = lang;
    this.pixCertifTermsOfServiceAccepted = pixCertifTosStatusDTO.isAccepted;
    this.allowedCertificationCenterAccesses = allowedCertificationCenterAccesses;
    this.certificationCenterMemberships = certificationCenterMemberships;
    this.pixCertifTermsOfServiceStatus = pixCertifTosStatusDTO.status;
    this.pixCertifTermsOfServiceDocumentPath = pixCertifTosStatusDTO.documentPath;
    this.lastPixCertifTermsOfServiceValidatedAt = pixCertifTosStatusDTO.acceptedAt;
  }
}

export { CertificationPointOfContact };
