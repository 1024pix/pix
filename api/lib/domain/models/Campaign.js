const types = {
  ASSESSMENT: 'ASSESSMENT',
  PROFILES_COLLECTION: 'PROFILES_COLLECTION',
};

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
    archivedAt,
    type,
    // includes
    targetProfile,
    campaignReport,
    campaignCollectiveResult,
    campaignAnalysis,
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
    this.archivedAt = archivedAt;
    this.type = type;
    // includes
    this.targetProfile = targetProfile;
    this.campaignReport = campaignReport;
    this.campaignCollectiveResult = campaignCollectiveResult;
    this.campaignAnalysis = campaignAnalysis;
    this.creator = creator;
    // references
    this.organizationId = organizationId;
    this.targetProfileId = targetProfileId;
    this.creatorId = creatorId;
  }

  isAssessment() {
    return this.type === types.ASSESSMENT;
  }

  isProfilesCollection() {
    return this.type === types.PROFILES_COLLECTION;
  }
}

Campaign.types = types;

module.exports = Campaign;
