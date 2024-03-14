class DataProtectionOfficer {
  constructor({
    id,
    firstName = '',
    lastName = '',
    email = '',
    organizationId,
    certificationCenterId,
    createdAt,
    updatedAt,
  } = {}) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.organizationId = organizationId;
    this.certificationCenterId = certificationCenterId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  updateInformation({ firstName, lastName, email }) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
  }
}

export { DataProtectionOfficer };
