class Campaign {

  constructor({
    id,
    // attributes
    name,
    code,
    // includes
    // references
    creatorId,
    organizationId
  } = {}) {
    this.id = id;
    // attributes
    this.name = name;
    this.code = code;
    // includes
    // references
    this.creatorId = creatorId;
    this.organizationId = organizationId;
  }
}

module.exports = Campaign;
