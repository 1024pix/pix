import Joi from 'joi';

import { DomainError, EntityValidationError } from '../../../../../shared/domain/errors.js';
import { REWARD_TYPES } from '../../../constants.js';
import { REQUIREMENT_TYPES } from '../../quests/entities/Quest.js';
import { Quest } from '../../quests/entities/Quest.js';
import { CombinedCourseBlueprint } from '../entities/CombinedCourseBlueprint.js';
import { QuestInput } from './QuestInput.js';

const schema = Joi.object({
  name: Joi.string(),
  internalName: Joi.string(),
  description: Joi.string().allow(null),
  prescriberDescription: Joi.string().allow(null),
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
    this.quest = new QuestInput({
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
    console.log(error);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details, undefined, { data: this });
    }
    if (this.schemaThreshold && this.#hasCappedTubeRequirements()) {
      throw EntityValidationError({ code: 'CAPPED_TUBE_REQUIREMENTS_SCHEMA_THRESHOLD_MISMATCH' });
    }
  }

  get needsCappedTubesFromTargetProfiles() {
    return this.schemaThreshold && !this.#hasCappedTubeRequirements;
  }

  setCappedTubes(cappedTubes) {
    if (!cappedTubes.length) {
      throw new DomainError('');
    }

    const formattedCapedTubes = cappedTubes.map(({ id, level }) => ({ tubeId: id, level }));
    const cappedTubesWithMaxLevels = Object.values(
      formattedCapedTubes.reduce((cappedTubesMap, cappedTube) => {
        if (!cappedTubesMap[cappedTube.tubeId]) {
          cappedTubesMap[cappedTube.tubeId] = cappedTube;
          return;
        }
        if (cappedTube.level > cappedTubesMap[cappedTube.tubeId].level) {
          cappedTubesMap[cappedTube.tubeId].level = cappedTube.level;
        }
      }, {}),
    );

    const cappedTubeRequirement = { tubes: cappedTubesWithMaxLevels, threshold: this.schemaThreshold };

    this.quest = new QuestInput({
      items: this.content ?? [],
      rewardId: this.quest.rewardId,
      rewardType: this.quest.rewardType,
      cappedTubeRequirement,
    }).toQuest();
  }

  #hasCappedTubeRequirements() {
    return Boolean(this.cappedTubeRequirements?.length);
  }

  #assertNoCappedTubeRequirementsAreDefinedWithoutTargetProfiles() {
    if (!this.targetProfileIds.length && this.#hasCappedTubeRequirements) {
      //todo: create a specific DomainError that extends generic Domain Error
      //and that has a code
      throw new DomainError('CAPPED_TUBE_REQUIREMENTS_WITHOUT_TARGET_PROFILE');
    }
  }

  #assertCappedTubeRequirementsAreBuiltIfThresholdIsDefined() {
    if (!this.#hasCappedTubeRequirements() && Boolean(this.schemaThreshold)) {
      //todo:
      throw new DomainError('CAPPED_TUBE_REQUIREMENTS_MISSING');
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
