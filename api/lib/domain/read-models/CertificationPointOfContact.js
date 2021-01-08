class CertificationPointOfContact {
  constructor({
    id,
    firstName,
    lastName,
    email,
    pixCertifTermsOfServiceAccepted,
    certificationCenters,
  }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.pixCertifTermsOfServiceAccepted = pixCertifTermsOfServiceAccepted;
    this.currentCertificationCenterId = certificationCenters[0].id;
    this.certificationCenters = certificationCenters.map((certificationCenter) => {
      return { ...certificationCenter, isRelatedOrganizationManagingStudents: Boolean(certificationCenter.isRelatedOrganizationManagingStudents) };
    });
  }
}

module.exports = CertificationPointOfContact;
