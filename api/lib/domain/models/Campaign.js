const types = {
  ASSESSMENT: 'ASSESSMENT',
  PROFILES_COLLECTION: 'PROFILES_COLLECTION',
};

class Campaign {

  constructor({
    id,
    name,
    code,
    title,
    idPixLabel,
    externalIdHelpImageUrl,
    alternativeTextToExternalIdHelpImage,
    createdAt,
    organizationLogoUrl,
    organizationName,
    organizationType,
    customLandingPageText,
    isRestricted = false,
    archivedAt,
    type,
    targetProfile,
    campaignReport,
    creator,
    organizationId,
    targetProfileId,
    creatorId,
  } = {}) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.title = title;
    this.idPixLabel = idPixLabel;
    this.externalIdHelpImageUrl = externalIdHelpImageUrl;
    this.alternativeTextToExternalIdHelpImage = alternativeTextToExternalIdHelpImage;
    this.createdAt = createdAt;
    this.organizationLogoUrl = organizationLogoUrl;
    this.organizationName = organizationName;
    this.organizationType = organizationType;
    this.customLandingPageText = customLandingPageText;
    this.isRestricted = isRestricted;
    this.archivedAt = archivedAt;
    this.type = type;
    this.targetProfile = targetProfile;
    this.campaignReport = campaignReport;
    this.creator = creator;
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

  isArchived() {
    return Boolean(this.archivedAt);
  }
}

Campaign.types = types;

module.exports = Campaign;
