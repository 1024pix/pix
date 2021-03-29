const _ = require('lodash');

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
    customLandingPageText,
    archivedAt,
    type,
    isForAbsoluteNovice,
    targetProfile,
    creator,
    organization,
    customResultPageText,
    customResultPageButtonText,
    customResultPageButtonUrl,
  } = {}) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.title = title;
    this.idPixLabel = idPixLabel;
    this.externalIdHelpImageUrl = externalIdHelpImageUrl;
    this.alternativeTextToExternalIdHelpImage = alternativeTextToExternalIdHelpImage;
    this.createdAt = createdAt;
    this.customLandingPageText = customLandingPageText;
    this.archivedAt = archivedAt;
    this.type = type;
    this.isForAbsoluteNovice = isForAbsoluteNovice;
    this.targetProfile = targetProfile;
    this.creator = creator;
    this.organization = organization;
    this.customResultPageText = customResultPageText;
    this.customResultPageButtonText = customResultPageButtonText;
    this.customResultPageButtonUrl = customResultPageButtonUrl;

  }

  get organizationId() {
    return _.get(this, 'organization.id', null);
  }

  get targetProfileId() {
    return _.get(this, 'targetProfile.id', null);
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
