class Campaign {

  constructor({
    id,
    // attributes
    name,
    code,
    idPix,
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
    this.idPix = idPix;
    this.createdAt = createdAt;
    // includes
    // references
    this.creatorId = creatorId;
    this.organizationId = organizationId;
    this.targetProfileId = targetProfileId;
  }
}

module.exports = Campaign;
