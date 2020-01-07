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
    organizationName,
    customLandingPageText,
    isRestricted = false,
    // includes
    targetProfile,
    campaignReport,
    campaignCollectiveResult,
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
    this.organizationName = organizationName;
    this.customLandingPageText = customLandingPageText;
    this.isRestricted = isRestricted;
    // includes
    this.targetProfile = targetProfile;
    this.campaignReport = campaignReport;
    this.campaignCollectiveResult = campaignCollectiveResult;
    // references
    this.creatorId = creatorId;
    this.organizationId = organizationId;
    this.targetProfileId = targetProfileId;
  }
}

module.exports = Campaign;
