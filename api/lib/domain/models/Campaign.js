class Campaign {

  constructor({
    id,
    // attributes
    name,
    code,
    createdAt,
    // includes
    // references
    creatorId,
    organizationId
  } = {}) {
    this.id = id;
    // attributes
    this.name = name;
    this.code = code;
    this.createdAt = createdAt;
    // includes
    // references
    this.creatorId = creatorId;
    this.organizationId = organizationId;
  }
}

module.exports = Campaign;
