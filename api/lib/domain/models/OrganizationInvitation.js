const statuses = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
};

class OrganizationInvitation {

  constructor({
    id,
    // attributes
    organizationId,
    email,
    status,
    temporaryKey,
    createdAt,
    updatedAt,
  } = {}) {
    this.id = id;
    // attributes
    this.organizationId = organizationId;
    this.email = email;
    this.status = status;
    this.temporaryKey = temporaryKey;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
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
