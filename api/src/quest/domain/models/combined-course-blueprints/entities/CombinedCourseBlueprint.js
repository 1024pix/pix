import { CampaignParticipationStatuses } from '../../../../../prescription/shared/domain/constants.js';
import { ObjectValidationError } from '../../../../../shared/domain/errors.js';
import { CombinedCourse } from '../../combined-courses/entities/CombinedCourse.js';
import {
  CRITERION_COMPARISONS,
  Quest,
  REQUIREMENT_COMPARISONS,
  REQUIREMENT_TYPES,
} from '../../quests/entities/Quest.js';
import { buildRequirement, TYPES } from '../../quests/value-objects/Requirement.js';
import {
  CampaignCombinedCourseBlueprintItem,
  ModuleCombinedCourseBlueprintItem,
} from '../value-objects/CombinedCourseBlueprintItem.js';

export class CombinedCourseBlueprint {
  constructor({
    id,
    name,
    internalName,
    description = null,
    illustration = null,
    surveyLink = null,
    createdAt = null,
    updatedAt = null,
    organizationIds = [],
    quest,
  }) {
    this.id = id;
    this.name = name;
    this.internalName = internalName;
    this.description = description;
    this.illustration = illustration;
    this.surveyLink = surveyLink;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.organizationIds = organizationIds;
    this.quest = quest;

    this.validate();
  }

  get targetProfileIds() {
    return this.quest.successRequirements
      .filter((item) => item.requirement_type === REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS)
      .map(({ data }) => parseInt(data.targetProfileId.data));
  }

  get moduleIds() {
    return this.quest.successRequirements
      .filter((item) => item.requirement_type === REQUIREMENT_TYPES.OBJECT.PASSAGES)
      .map(({ data }) => data.moduleId.data);
  }

  toCombinedCourse({ code, organizationId, campaigns, name, illustration, description }) {
    const successRequirements = this.quest.successRequirements.map((requirement) => {
      if (requirement.requirement_type === REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS) {
        const requirementTargetProfileId = requirement.data.targetProfileId.data;
        const campaignId = campaigns.find(({ targetProfileId }) => targetProfileId === requirementTargetProfileId).id;
        return CombinedCourseBlueprint.buildRequirementForCombinedCourse({
          campaignId,
        });
      } else if (requirement.requirement_type === REQUIREMENT_TYPES.OBJECT.PASSAGES) {
        return CombinedCourseBlueprint.buildRequirementForCombinedCourse({
          moduleId: requirement.data.moduleId.data,
        });
      } else {
        return requirement;
      }
    });

    const createdAt = new Date();

    const quest = new Quest({
      createdAt,
      updatedAt: createdAt,
      rewardType: this.quest.rewardType,
      rewardId: this.quest.rewardId,
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

  static buildRequirementForCombinedCourse({ campaignId, moduleId, targetProfileId }) {
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
    } else if (targetProfileId) {
      return buildRequirement({
        requirement_type: REQUIREMENT_TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS,
        comparison: REQUIREMENT_COMPARISONS.ALL,
        data: {
          targetProfileId: { data: targetProfileId, comparison: CRITERION_COMPARISONS.EQUAL },
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

  update({ combinedCourseBlueprintForUpdate }) {
    this.name = combinedCourseBlueprintForUpdate.name;
    this.internalName = combinedCourseBlueprintForUpdate.internalName;
    this.description = combinedCourseBlueprintForUpdate.description;
    this.illustration = combinedCourseBlueprintForUpdate.illustration;
    this.surveyLink = combinedCourseBlueprintForUpdate.surveyLink;

    return this;
  }

  validate() {
    if (!this.name) throw new ObjectValidationError('Name is required');
    if (!this.internalName) throw new ObjectValidationError('InternalName is required');
    if (!this.quest) throw new ObjectValidationError('Quest is required');
  }

  generateItems({ targetProfiles, modules, recommendableModules }) {
    this.items = this.quest.successRequirements.map((requirement) => {
      if (requirement.requirement_type === TYPES.OBJECT.CAMPAIGN_PARTICIPATIONS) {
        const targetProfile = targetProfiles.find(
          (targetProfile) => targetProfile.id === parseInt(requirement.data.targetProfileId.data),
        );
        return new CampaignCombinedCourseBlueprintItem({ id: targetProfile.id, name: targetProfile.name });
      }
      if (requirement.requirement_type === TYPES.OBJECT.PASSAGES) {
        const module = modules.find((module) => module.id === requirement.data.moduleId.data);
        const recommendableModule = recommendableModules.find(({ moduleId }) => moduleId === module.id);

        return new ModuleCombinedCourseBlueprintItem({
          id: module.id,
          name: module.title,
          duration: module.duration,
          image: module.image,
          isRecommendable: Boolean(recommendableModule),
        });
      }
    });
  }
}
