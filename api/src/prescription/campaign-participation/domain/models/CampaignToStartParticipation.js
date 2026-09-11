import { CampaignTypes } from '../../../shared/domain/constants.ts';

class CampaignToStartParticipation {
  constructor({
    id,
    externalIdLabel,
    externalIdType,
    archivedAt,
    type,
    isManagingStudents,
    hasLearnersImportFeature,
    multipleSendings,
    assessmentMethod,
    skillCount,
    organizationId,
    deletedAt,
  } = {}) {
    this.id = id;
    this.type = type;
    this.externalIdLabel = externalIdLabel;
    this.externalIdType = externalIdType;
    this.archivedAt = archivedAt;
    this.multipleSendings = multipleSendings;
    this.assessmentMethod = assessmentMethod;
    this.skillCount = skillCount;
    this.organizationId = organizationId;
    this.deletedAt = deletedAt;
    this.isRestricted = isManagingStudents || hasLearnersImportFeature;
  }

  get isAssessment() {
    return this.type === CampaignTypes.ASSESSMENT;
  }

  get isExam() {
    return this.type === CampaignTypes.EXAM;
  }

  get isArchived() {
    return Boolean(this.archivedAt);
  }

  get isDeleted() {
    return Boolean(this.deletedAt);
  }
}

export { CampaignToStartParticipation };
