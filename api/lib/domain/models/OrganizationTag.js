class OrganizationTag {

  constructor({
    id,
    organizationId,
    tagId,
  } = {}) {
    this.id = id;
    this.organizationId = organizationId;
    this.tagId = tagId;
  }
}

module.exports = OrganizationTag;
