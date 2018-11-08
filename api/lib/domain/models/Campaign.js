class Campaign {

  constructor({
    id,
    // attributes
    name,
    code,
    title,
    idPixLabel,
    createdAt,
    organizationLogoUrl,
    customLandingPageText,
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
    this.title = title;
    this.idPixLabel = idPixLabel;
    this.createdAt = createdAt;
    this.organizationLogoUrl = organizationLogoUrl;
    this.customLandingPageText = customLandingPageText;
    // includes
    // references
    this.creatorId = creatorId;
    this.organizationId = organizationId;
    this.targetProfileId = targetProfileId;
  }
}

module.exports = Campaign;
