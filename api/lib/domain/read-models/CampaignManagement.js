class CampaignManagement {
  constructor({
    id,
    code,
    name,
    idPixLabel,
    createdAt,
    archivedAt,
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
    this.creatorLastName = creatorLastName;
    this.creatorFirstName = creatorFirstName;
    this.creatorId = creatorId;
    this.organizationId = organizationId;
    this.organizationName = organizationName;
    this.targetProfileId = targetProfileId;
    this.targetProfileName = targetProfileName;
    this.title = title;
    this.customLandingPageText = customLandingPageText;
    this.customResultPageText = customResultPageText;
    this.customResultPageButtonText = customResultPageButtonText;
    this.customResultPageButtonUrl = customResultPageButtonUrl;
    this.ownerLastName = ownerLastName;
    this.ownerFirstName = ownerFirstName;
    this.ownerId = ownerId;
    this.sharedParticipationsCount = shared;
    this.totalParticipationsCount = this.sharedParticipationsCount + (started || 0) + completed;
    this.multipleSendings = multipleSendings;
  }

  get isTypeProfilesCollection() {
    return this.type === 'PROFILES_COLLECTION';
  }

  get isTypeAssessment() {
    return this.type === 'ASSESSMENT';
  }
}

export default CampaignManagement;
