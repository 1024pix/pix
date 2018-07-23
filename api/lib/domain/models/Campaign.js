class Campaign {

  constructor({ id, name, code, creatorId, organizationId } = {}) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.creatorId = creatorId;
    this.organizationId = organizationId;
  }
}

module.exports = Campaign;
