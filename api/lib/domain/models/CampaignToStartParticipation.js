const { types } = require('../models/Campaign');

class CampaignToStartParticipation {
  constructor({
    id,
    idPixLabel,
    archivedAt,
    type,
    isRestricted,
    multipleSendings,
    assessmentMethod,
    skillCount,
    organizationId,
  } = {}) {
    this.id = id;
    this.type = type;
    this.idPixLabel = idPixLabel;
    this.archivedAt = archivedAt;
    this.isRestricted = isRestricted;
    this.multipleSendings = multipleSendings;
    this.assessmentMethod = assessmentMethod;
    this.skillCount = skillCount;
    this.organizationId = organizationId;
  }

  get isAssessment() {
    return this.type === types.ASSESSMENT;
  }

  get isArchived() {
    return Boolean(this.archivedAt);
  }
}

module.exports = CampaignToStartParticipation;
