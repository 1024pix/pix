const { types } = require('./Campaign');

class CampaignToJoin {
  constructor({
    id,
    code,
    title,
    idPixLabel,
    customLandingPageText,
    externalIdHelpImageUrl,
    alternativeTextToExternalIdHelpImage,
    archivedAt,
    type,
    organizationId,
    organizationName,
    organizationType,
    organizationIsManagingStudents,
    targetProfileId,
    targetProfileName,
  } = {}) {
    this.id = id;
    this.code = code;
    this.title = title;
    this.type = type;
    this.idPixLabel = idPixLabel;
    this.customLandingPageText = customLandingPageText;
    this.externalIdHelpImageUrl = externalIdHelpImageUrl;
    this.alternativeTextToExternalIdHelpImage = alternativeTextToExternalIdHelpImage;
    this.archivedAt = archivedAt;
    this.isRestricted = organizationIsManagingStudents;
    this.organizationId = organizationId;
    this.organizationName = organizationName;
    this.organizationType = organizationType;
    this.targetProfileId = targetProfileId;
    this.targetProfileName = targetProfileName;
  }

  get isAssessment() {
    return this.type === types.ASSESSMENT;
  }

  get isProfilesCollection() {
    return this.type === types.PROFILES_COLLECTION;
  }

  get isArchived() {
    return Boolean(this.archivedAt);
  }
}

CampaignToJoin.types = types;

module.exports = CampaignToJoin;
