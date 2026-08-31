import Joi from 'joi';

import { EntityValidationError } from '../../../../../shared/domain/errors.js';
import { REWARD_TYPES } from '../../../constants.js';
import {
  CappedTubeNotProvidedError,
  CappedTubeRequirementsMissingError,
  CappedTubeRequirementWithoutTargetProfilesError,
} from '../../../errors.js';
import { Quest, REQUIREMENT_TYPES } from '../../quests/entities/Quest.js';
import { CombinedCourseBlueprint } from '../entities/CombinedCourseBlueprint.js';
import { QuestInput } from './QuestInput.js';

const schema = Joi.object({
  name: Joi.string().required(),
  internalName: Joi.string().required(),
  description: Joi.string().required(),
  prescriberDescription: Joi.string().required(),
  illustration: Joi.string().uri().allow(null),
  rewardRequirementsDescription: Joi.string().allow(null),
  quest: Joi.object().instance(Quest),
  surveyLink: Joi.string().uri().allow(null),
  schemaThreshold: Joi.number().allow(null),
  cappedTubeRequirements: Joi.array().allow(null),
  content: Joi.array().required(),
});

export class CombinedCourseBlueprintForCreation {
  constructor({
    name,
    internalName,
    description,
    prescriberDescription,
    illustration,
    rewardRequirementsDescription = null,
    surveyLink = null,
    quest,
    content,
    rewardType,
    rewardId,
    cappedTubeRequirements,
    schemaThreshold,
  }) {
    this.name = name;
    this.internalName = internalName;
    this.description = description;
    this.prescriberDescription = prescriberDescription;
    this.illustration = illustration;
    this.rewardRequirementsDescription = rewardRequirementsDescription;
    this.quest =
      quest ??
      new QuestInput({
        items: content ?? [],
        rewardId: rewardId,
        rewardType: REWARD_TYPES[rewardType] ?? null,
        cappedTubeRequirements: cappedTubeRequirements ?? [],
      }).toQuest();
    this.surveyLink = surveyLink;
    this.schemaThreshold = schemaThreshold;
    this.content = content;
    this.cappedTubeRequirements = cappedTubeRequirements;

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
    if (this.schemaThreshold && this.cappedTubeRequirements?.length) {
      throw new EntityValidationError(
        {
          invalidAttributes: [
            {
              attribute: 'cappedTubesRequirements',
              message: 'Should not have both a schemaThreshold and selected cappedTubesRequirements.',
            },
          ],
        },
        'CAPPED_TUBE_REQUIREMENTS_SCHEMA_THRESHOLD_MISMATCH',
        { data: this },
      );
    }
  }

  get needsCappedTubesFromTargetProfiles() {
    return Boolean(this.schemaThreshold && (!this.cappedTubeRequirements || this.cappedTubeRequirements.length < 1));
  }

  setCappedTubes(cappedTubes) {
    if (!cappedTubes.length) {
      throw new CappedTubeNotProvidedError();
    }

    const maxLevelByTubeId = new Map();
    for (const { id, level } of cappedTubes) {
      const currentLevel = maxLevelByTubeId.get(id);
      if (currentLevel === undefined || currentLevel < level) {
        maxLevelByTubeId.set(id, level);
      }
    }

    const cappedTubesWithMaxLevels = [...maxLevelByTubeId].map(([tubeId, level]) => ({ tubeId, level }));

    const cappedTubeRequirements = [{ tubes: cappedTubesWithMaxLevels, threshold: this.schemaThreshold }];

    const questInput = new QuestInput({
      items: this.content ?? [],
      rewardId: this.quest.rewardId,
      rewardType: this.quest.rewardType,
      cappedTubeRequirements,
    });
    this.quest = questInput.toQuest();
  }

  #assertNoCappedTubeRequirementsAreDefinedWithoutTargetProfiles() {
    if (!this.targetProfileIds.length && this.quest.hasCappedTubeRequirements) {
      throw new CappedTubeRequirementWithoutTargetProfilesError();
    }
  }

  #assertCappedTubeRequirementsAreBuiltIfThresholdIsDefined() {
    if (Boolean(this.schemaThreshold) && !this.quest.hasCappedTubeRequirements) {
      throw new CappedTubeRequirementsMissingError();
    }
  }

  toCombinedCourseBlueprint() {
    this.#assertNoCappedTubeRequirementsAreDefinedWithoutTargetProfiles();
    this.#assertCappedTubeRequirementsAreBuiltIfThresholdIsDefined();
    return new CombinedCourseBlueprint({
      name: this.name,
      internalName: this.internalName,
      description: this.description,
      prescriberDescription: this.prescriberDescription,
      illustration: this.illustration,
      surveyLink: this.surveyLink,
      quest: this.quest,
      rewardRequirementsDescription: this.rewardRequirementsDescription,
    });
  }
}
