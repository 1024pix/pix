class UserOrganizationForAdmin {
  constructor({
    id,
    updatedAt,
    organizationRole,
    organizationId,
    organizationName,
    organizationType,
    organizationExternalId,
  } = {}) {
    this.id = id;
    this.updatedAt = updatedAt;
    this.organizationRole = organizationRole;
    this.organizationId = organizationId;
    this.organizationName = organizationName;
    this.organizationType = organizationType;
    this.organizationExternalId = organizationExternalId;
  }
}

export default UserOrganizationForAdmin;
