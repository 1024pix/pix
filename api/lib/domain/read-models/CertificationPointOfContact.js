class CertificationPointOfContact {
  constructor({ id, firstName, lastName, email, pixCertifTermsOfServiceAccepted, allowedCertificationCenterAccesses }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.pixCertifTermsOfServiceAccepted = pixCertifTermsOfServiceAccepted;
    this.allowedCertificationCenterAccesses = allowedCertificationCenterAccesses;
  }
}

export default CertificationPointOfContact;
