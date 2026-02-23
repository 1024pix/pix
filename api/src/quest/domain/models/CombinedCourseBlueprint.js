import Joi from 'joi';

import { CampaignParticipationStatuses } from '../../../prescription/shared/domain/constants.js';
import { CombinedCourse } from './CombinedCourse.js';
import { CRITERION_COMPARISONS, Quest, REQUIREMENT_COMPARISONS, REQUIREMENT_TYPES } from './Quest.js';
import { buildRequirement } from './Requirement.js';

export class CombinedCourseBlueprint {
  constructor({
    id,
    name,
    internalName,
    description,
    illustration,
    content,
    createdAt,
    updatedAt,
    organizationIds = [],
    questId = null,
  }) {
    this.id = id;
    this.name = name;
    this.internalName = internalName;
    this.description = description;
    this.illustration = illustration;
    this.content = content;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.organizationIds = organizationIds;
    this.questId = questId;
  }

  get targetProfileIds() {
    return this.content
      .filter((item) => item.type === COMBINED_COURSE_BLUEPRINT_ITEMS.EVALUATION)
      .map(({ value }) => parseInt(value));
  }

  get moduleShortIds() {
    return this.content
      .filter((item) => item.type === COMBINED_COURSE_BLUEPRINT_ITEMS.MODULE)
      .map(({ value }) => value);
  }

  toCombinedCourse({ code, organizationId, campaigns, modulesByShortId, name, illustration, description }) {
    const successRequirements = this.content.map((requirement) => {
      if (requirement.type === COMBINED_COURSE_BLUEPRINT_ITEMS.EVALUATION) {
        const requirementTargetProfileId = requirement.value;
        const campaignId = campaigns.find(({ targetProfileId }) => targetProfileId === requirementTargetProfileId).id;
        return CombinedCourseBlueprint.buildRequirementForCombinedCourse({
          campaignId,
        });
      } else if (requirement.type === COMBINED_COURSE_BLUEPRINT_ITEMS.MODULE) {
        const [module] = modulesByShortId[requirement.value];
        return CombinedCourseBlueprint.buildRequirementForCombinedCourse({
          moduleId: module.id,
        });
      } else {
        return requirement;
      }
    });

    const createdAt = new Date();

    const quest = new Quest({
      id: this.questId,
      createdAt: createdAt,
      updatedAt: createdAt,
      rewardType: null,
      rewardId: null,
      eligibilityRequirements: [],
      successRequirements,
    });

    return new CombinedCourse(
      {
        blueprintId: this.id,
        name: name ?? this.name,
        code,
        organizationId,
        description: description ?? this.description,
        illustration: illustration ?? this.illustration,
      },
      quest,
    );
  }

  static buildRequirementForCombinedCourse({ campaignId, moduleId }) {
    if (campaignId) {
      return buildRequirement({
        requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
        comparison: REQUIREMENT_COMPARISONS.ALL,
        data: {
          campaignId: { data: campaignId, comparison: CRITERION_COMPARISONS.EQUAL },
          status: {
            data: CampaignParticipationStatuses.SHARED,
            comparison: CRITERION_COMPARISONS.EQUAL,
          },
        },
      });
    } else if (moduleId) {
      return buildRequirement({
        requirement_type: REQUIREMENT_TYPES.OBJECT.PASSAGES,
        comparison: REQUIREMENT_COMPARISONS.ALL,
        data: {
          moduleId: { data: moduleId, comparison: CRITERION_COMPARISONS.EQUAL },
          isTerminated: { data: true, comparison: CRITERION_COMPARISONS.EQUAL },
        },
      });
    }
  }
  static buildContentItems(items) {
    const data = items.map(({ moduleShortId, targetProfileId }) => {
      return moduleShortId
        ? { type: COMBINED_COURSE_BLUEPRINT_ITEMS.MODULE, value: moduleShortId }
        : { type: COMBINED_COURSE_BLUEPRINT_ITEMS.EVALUATION, value: targetProfileId };
    });
    return Joi.attempt(data, contentSchema);
  }
  detachOrganization({ organizationId }) {
    this.organizationIds = this.organizationIds.filter((id) => id !== organizationId);
  }
  attachOrganizations({ organizationIds }) {
    const duplicatedOrganizationIds = [];
    const attachedOrganizationIds = [];
    organizationIds.map((organizationId) => {
      if (this.organizationIds.includes(organizationId)) {
        duplicatedOrganizationIds.push(organizationId);
      } else {
        attachedOrganizationIds.push(organizationId);
      }
    });

    this.organizationIds.push(...attachedOrganizationIds);
    return { duplicatedOrganizationIds, attachedOrganizationIds };
  }
}

export const COMBINED_COURSE_BLUEPRINT_ITEMS = {
  MODULE: 'module',
  EVALUATION: 'evaluation',
};

export const contentSchema = Joi.array()
  .items(
    Joi.object({
      type: Joi.string()
        .valid(COMBINED_COURSE_BLUEPRINT_ITEMS.EVALUATION, COMBINED_COURSE_BLUEPRINT_ITEMS.MODULE)
        .required(),
      value: Joi.alternatives()
        .conditional('type', {
          switch: [
            {
              is: COMBINED_COURSE_BLUEPRINT_ITEMS.EVALUATION,
              then: Joi.number().integer(),
            },
            {
              is: COMBINED_COURSE_BLUEPRINT_ITEMS.MODULE,
              then: Joi.string(),
            },
          ],
        })
        .required(),
    }),
  )
  .required()
  .strict();
