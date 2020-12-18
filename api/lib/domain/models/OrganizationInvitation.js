const statuses = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
};

class OrganizationInvitation {

  constructor({
    id,
    email,
    status,
    code,
    organizationName,
    role,
    createdAt,
    updatedAt,
    //references
    organizationId,
  } = {}) {
    this.id = id;
    this.email = email;
    this.status = status;
    this.code = code;
    this.organizationName = organizationName;
    this.role = role;
    this.createdAt = createdAt;
    this.role = role;
    this.updatedAt = updatedAt;
    //references
    this.organizationId = organizationId;
  }

  get isPending() {
    return this.status === statuses.PENDING;
  }

  get isAccepted() {
    return this.status === statuses.ACCEPTED;
  }
}

OrganizationInvitation.StatusType = statuses;

module.exports = OrganizationInvitation;
