import { ObjectValidationError } from '../../../shared/domain/errors.js';
import { REQUIREMENT_TYPES } from './Quest.js';

export class AdminCombinedCourseBlueprint {
  constructor({
    id,
    name,
    internalName,
    description,
    illustration,
    attestationLabel,
    rewardId = null,
    rewardType = null,
    quest,
    surveyLink = null,
    createdAt,
    updatedAt,
    organizationIds = [],
  }) {
    this.id = id;
    this.name = name;
    this.internalName = internalName;
    this.description = description;
    this.illustration = illustration;
    this.organizationIds = organizationIds;
    this.attestationLabel = attestationLabel;
    this.rewardId = rewardId;
    this.rewardType = rewardType;
    this.quest = quest;
    this.surveyLink = surveyLink;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;

    this.validate();
  }

  get targetProfileIds() {
    return this.quest.successRequirements
      .filter((item) => item.requirement_type === REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS)
      .map(({ data }) => parseInt(data.targetProfileId.data));
  }

  validate() {
    if (!this.quest) throw new ObjectValidationError('Quest is required');
  }
}
