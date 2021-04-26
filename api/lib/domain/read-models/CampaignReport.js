const { types } = require('../models/Campaign');

class CampaignReport {
  constructor({
    id,
    name,
    code,
    title,
    idPixLabel,
    createdAt,
    customLandingPageText,
    archivedAt,
    type,
    creatorId,
    creatorLastName,
    creatorFirstName,
    targetProfileId,
    targetProfileName,
    targetProfileImageUrl,
    participationsCount = 0,
    sharedParticipationsCount = 0,
    badges = [],
    stages = [],
  } = {}) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.title = title;
    this.type = type;
    this.idPixLabel = idPixLabel;
    this.customLandingPageText = customLandingPageText;
    this.createdAt = createdAt;
    this.archivedAt = archivedAt;
    this.creatorId = creatorId;
    this.creatorLastName = creatorLastName;
    this.creatorFirstName = creatorFirstName;
    this.targetProfileId = targetProfileId;
    this.targetProfileName = targetProfileName;
    this.targetProfileImageUrl = targetProfileImageUrl;
    this.participationsCount = participationsCount;
    this.sharedParticipationsCount = sharedParticipationsCount;
    this.badges = badges;
    this.stages = stages;
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

module.exports = CampaignReport;
