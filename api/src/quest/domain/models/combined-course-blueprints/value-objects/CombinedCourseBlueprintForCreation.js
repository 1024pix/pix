import Joi from 'joi';

import { EntityValidationError } from '../../../../../shared/domain/errors.js';
import { REQUIREMENT_TYPES } from '../../quests/entities/Quest.js';
import { Quest } from '../../quests/entities/Quest.js';

const schema = Joi.object({
  name: Joi.string().required(),
  internalName: Joi.string().required(),
  description: Joi.string().allow(null),
  prescriberDescription: Joi.string().allow(null),
  illustration: Joi.string().uri().allow(null),
  rewardId: Joi.number().allow(null),
  rewardType: Joi.string().valid('attestations').allow(null),
  rewardRequirementsDescription: Joi.string().allow(null),
  quest: Joi.object().instance(Quest),
  surveyLink: Joi.string().uri().allow(null),
});

export class CombinedCourseBlueprintForCreation {
  constructor({
    name,
    internalName,
    description,
    prescriberDescription,
    illustration,
    rewardId = null,
    rewardType = null,
    rewardRequirementsDescription = null,
    quest,
    surveyLink = null,
  }) {
    this.name = name;
    this.internalName = internalName;
    this.description = description;
    this.prescriberDescription = prescriberDescription;
    this.illustration = illustration;
    this.rewardId = rewardId;
    this.rewardType = rewardType;
    this.rewardRequirementsDescription = rewardRequirementsDescription;
    this.quest = quest;
    this.surveyLink = surveyLink;

    this.#validate();
  }

  get targetProfileIds() {
    return this.quest.successRequirements
      .filter((item) => item.requirement_type === REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS)
      .map(({ data }) => parseInt(data.targetProfileId.data));
  }

  #validate() {
    const { error } = schema.validate(this);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details, undefined, { data: this });
    }
  }
}
