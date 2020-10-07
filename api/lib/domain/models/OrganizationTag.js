class OrganizationTag {

  constructor({
    id,
    // references
    organizationId,
    tagId,
  } = {}) {
    this.id = id;
    // references
    this.organizationId = organizationId;
    this.tagId = tagId;
  }
}

module.exports = OrganizationTag;
