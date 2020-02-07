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
    creator,
    // references
    organizationId,
    targetProfileId,
    creatorId
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
    this.creator = creator;
    // references
    this.organizationId = organizationId;
    this.targetProfileId = targetProfileId;
    this.creatorId = creatorId;
  }
}

module.exports = Campaign;
