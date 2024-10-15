import { CampaignTypes } from '../../../shared/domain/constants.js';
class CampaignManagement {
  constructor({
    id,
    code,
    name,
    idPixLabel,
    createdAt,
    archivedAt,
    deletedAt,
    type,
    creatorLastName,
    creatorFirstName,
    creatorId,
    organizationId,
    organizationName,
    targetProfileId,
    targetProfileName,
    title,
    customLandingPageText,
    customResultPageText,
    customResultPageButtonText,
    customResultPageButtonUrl,
    isForAbsoluteNovice,
    ownerLastName,
    ownerFirstName,
    ownerId,
    shared,
    started,
    completed,
    multipleSendings,
  } = {}) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.type = type;
    this.idPixLabel = idPixLabel;
    this.createdAt = createdAt;
    this.archivedAt = archivedAt;
    this.deletedAt = deletedAt;
    this.creatorLastName = creatorLastName;
    this.creatorFirstName = creatorFirstName;
    this.creatorId = creatorId;
    this.organizationId = organizationId;
    this.organizationName = organizationName;
    this.targetProfileId = targetProfileId;
    this.targetProfileName = targetProfileName;
    this.isForAbsoluteNovice = isForAbsoluteNovice;
    this.title = title;
    this.customLandingPageText = customLandingPageText;
    this.customResultPageText = customResultPageText;
    this.customResultPageButtonText = customResultPageButtonText;
    this.customResultPageButtonUrl = customResultPageButtonUrl;
    this.ownerLastName = ownerLastName;
    this.ownerFirstName = ownerFirstName;
    this.ownerId = ownerId;
    this.sharedParticipationsCount = shared;
    this.totalParticipationsCount = this.#computeTotalParticipation(this.sharedParticipationsCount, started, completed);
    this.multipleSendings = multipleSendings;
  }

  get isTypeProfilesCollection() {
    return this.type === CampaignTypes.PROFILES_COLLECTION;
  }

  get isTypeAssessment() {
    return this.type === CampaignTypes.ASSESSMENT;
  }

  #computeTotalParticipation(sharedParticipationsCount, started, completed) {
    return sharedParticipationsCount + (started || 0) + completed;
  }
}

export { CampaignManagement };
