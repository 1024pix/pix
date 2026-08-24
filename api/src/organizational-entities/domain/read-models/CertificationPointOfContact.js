class CertificationPointOfContact {
  constructor({
    id,
    firstName,
    lastName,
    email,
    lang,
    pixCertifTermsOfServiceAccepted,
    allowedCertificationCenterAccesses,
    certificationCenterMemberships,
  }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.lang = lang;
    this.pixCertifTermsOfServiceAccepted = pixCertifTermsOfServiceAccepted;
    this.allowedCertificationCenterAccesses = allowedCertificationCenterAccesses;
    this.certificationCenterMemberships = certificationCenterMemberships;
  }
}

export { CertificationPointOfContact };
