class Campaign {

  constructor({
    id,
    // attributes
    name,
    code,
    idPixLabel,
    createdAt,
    // includes
    // references
    creatorId,
    organizationId,
    targetProfileId
  } = {}) {
    this.id = id;
    // attributes
    this.name = name;
    this.code = code;
    this.idPixLabel = idPixLabel;
    this.createdAt = createdAt;
    // includes
    // references
    this.creatorId = creatorId;
    this.organizationId = organizationId;
    this.targetProfileId = targetProfileId;
  }
}

module.exports = Campaign;
