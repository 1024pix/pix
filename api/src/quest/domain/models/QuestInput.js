import Joi from 'joi';

import { EntityValidationError } from '../../../shared/domain/errors.js';
import { COMBINED_COURSE_ITEM_TYPES } from '../constants.js';
import { CombinedCourseBlueprint } from './CombinedCourseBlueprint.js';
import { Quest, REQUIREMENT_TYPES } from './quests/entities/Quest.js';
import { buildRequirement } from './quests/value-objects/Requirement.js';

const itemsSchema = Joi.array()
  .items(
    Joi.object({
      type: Joi.string().valid(COMBINED_COURSE_ITEM_TYPES.EVALUATION, COMBINED_COURSE_ITEM_TYPES.MODULE).required(),
      value: Joi.alternatives()
        .conditional('type', {
          switch: [
            {
              is: COMBINED_COURSE_ITEM_TYPES.EVALUATION,
              then: Joi.number().integer(),
            },
            {
              is: COMBINED_COURSE_ITEM_TYPES.MODULE,
              then: Joi.string(),
            },
          ],
        })
        .required(),
      shortId: Joi.string().optional(),
    }),
  )
  .required()
  .strict();

export class QuestInput {
  constructor({ items, rewardId, rewardType, cappedTubeRequirements = [] } = {}) {
    this.items = items;
    this.rewardId = rewardId;
    this.rewardType = rewardType;
    this.cappedTubeRequirements = cappedTubeRequirements;
    this.#validate();
  }

  #validate() {
    const { error } = itemsSchema.validate(this.items);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details, undefined, { data: this.items });
    }
  }

  toQuest() {
    const successRequirements = this.items.map((item) => {
      if (item.type === COMBINED_COURSE_ITEM_TYPES.MODULE) {
        return CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: item.value });
      }
      return CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId: item.value });
    });

    const cappedTubes = this.cappedTubeRequirements.map((requirement) => {
      return buildRequirement({
        requirement_type: REQUIREMENT_TYPES.CAPPED_TUBES,
        data: {
          threshold: requirement.threshold,
          cappedTubes: requirement.tubes,
        },
      });
    });

    successRequirements.push(...cappedTubes);

    return new Quest({
      eligibilityRequirements: [],
      successRequirements,
      rewardId: this.rewardId,
      rewardType: this.rewardType,
    });
  }

  static itemsFromQuest({ quest, modulesById }) {
    return quest.successRequirements.map((requirement) => {
      if (requirement.requirement_type === REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS) {
        return { type: COMBINED_COURSE_ITEM_TYPES.EVALUATION, value: requirement.data.targetProfileId.data };
      }
      const moduleId = requirement.data.moduleId.data;
      const shortId = modulesById[moduleId][0].shortId;
      return { type: COMBINED_COURSE_ITEM_TYPES.MODULE, value: moduleId, shortId };
    });
  }
}
