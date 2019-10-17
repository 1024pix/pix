const statuses = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
};

class OrganizationInvitation {

  constructor({
    id,
    // attributes
    email,
    status,
    code,
    organizationName,
    createdAt,
    updatedAt,
    //references
    organizationId,
  } = {}) {
    this.id = id;
    // attributes
    this.email = email;
    this.status = status;
    this.code = code;
    this.organizationName = organizationName;
    this.createdAt = createdAt;
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
