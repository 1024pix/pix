class UserOrganizationForAdmin {
  constructor({
    id,
    updatedAt,
    role,
    organizationId,
    organizationName,
    organizationType,
    organizationExternalId,
  } = {}) {
    this.id = id;
    this.updatedAt = updatedAt;
    this.role = role;
    this.organizationId = organizationId;
    this.organizationName = organizationName;
    this.organizationType = organizationType;
    this.organizationExternalId = organizationExternalId;
  }
}

module.exports = UserOrganizationForAdmin;
