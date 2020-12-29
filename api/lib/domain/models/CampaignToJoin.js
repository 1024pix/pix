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
    organizationLogoUrl,
    organizationIsManagingStudents,
  } = {}) {
    this.id = id;
    this.code = code;
    this.title = title;
    this.idPixLabel = idPixLabel;
    this.customLandingPageText = customLandingPageText;
    this.externalIdHelpImageUrl = externalIdHelpImageUrl;
    this.alternativeTextToExternalIdHelpImage = alternativeTextToExternalIdHelpImage;
    this.archivedAt = archivedAt;
    this.type = type;
    this.organizationId = organizationId;
    this.organizationName = organizationName;
    this.organizationType = organizationType;
    this.organizationLogoUrl = organizationLogoUrl;
    this.isRestricted = organizationIsManagingStudents;
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

CampaignToJoin.types = types;

module.exports = CampaignToJoin;
