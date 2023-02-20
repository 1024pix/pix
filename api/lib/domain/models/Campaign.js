import _ from 'lodash';
import CampaignTypes from './CampaignTypes';

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
    archivedBy,
    type,
    isForAbsoluteNovice,
    targetProfile,
    creator,
    ownerId,
    organization,
    customResultPageText,
    customResultPageButtonText,
    customResultPageButtonUrl,
    multipleSendings,
    assessmentMethod,
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
    this.archivedBy = archivedBy;
    this.type = type;
    this.isForAbsoluteNovice = isForAbsoluteNovice;
    this.targetProfile = targetProfile;
    this.creator = creator;
    this.ownerId = ownerId;
    this.organization = organization;
    this.customResultPageText = customResultPageText;
    this.customResultPageButtonText = customResultPageButtonText;
    this.customResultPageButtonUrl = customResultPageButtonUrl;
    this.multipleSendings = multipleSendings;
    this.assessmentMethod = assessmentMethod;
  }

  get organizationId() {
    return _.get(this, 'organization.id', null);
  }

  get targetProfileId() {
    return _.get(this, 'targetProfile.id', null);
  }

  isAssessment() {
    return this.type === CampaignTypes.ASSESSMENT;
  }

  isProfilesCollection() {
    return this.type === CampaignTypes.PROFILES_COLLECTION;
  }

  isArchived() {
    return Boolean(this.archivedAt);
  }
}

export default Campaign;
