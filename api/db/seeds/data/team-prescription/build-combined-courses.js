import { CampaignParticipationStatuses } from '../../../../src/prescription/shared/domain/constants.js';
import { CombinedCourseBlueprint } from '../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { OrganizationLearnerParticipationTypes } from '../../../../src/quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';
import { buildCombinedCourseBlueprint } from '../../../database-builder/factory/build-combined-course-blueprint.js';
import { buildCombinedCourseBlueprintShare } from '../../../database-builder/factory/build-combined-course-blueprint-share.js';
import {
  PRO_ORGANIZATION_ID,
  SCO_MANAGING_ORGANIZATION_ID,
  SCO_ORGANIZATION_ID,
  SUP_ORGANIZATION_ID,
} from '../common/constants.js';
import { PRO_COMBINED_COURSE } from './fixtures/pro-combined-course.js';
import { COMBINED_COURSE_WITHOUT_CAMPAIGN } from './fixtures/pro-combined-course-without-campaign.js';
import { COMBINED_COURSE_WITHOUT_MODULES } from './fixtures/pro-combined-course-without-modules.js';
import { MAXI_COMBINED_COURSE } from './fixtures/pro-complete-combined-course.js';
import { PRO_MANAGING_COMBINED_COURSE } from './fixtures/pro-managing-combined-course.js';
import { SCO_SIECLE_COMBINED_COURSE } from './fixtures/sco-siecle-combined-course.js';
import { SUP_IMPORT_COMBINED_COURSE } from './fixtures/sup-import-combined-course.js';

const buildCombinixQuest = (databaseBuilder, combinedCourseData) => {
  const {
    buildAssessment,
    buildCampaign,
    buildCampaignParticipation,
    buildCampaignSkill,
    buildCombinedCourse,
    buildCombinedCourseBlueprint,
    buildKnowledgeElementSnapshot,
    buildOrganizationLearner,
    buildOrganizationLearnerParticipation,
    buildQuestForCombinedCourse,
    buildStage,
    buildStageAcquisition,
    buildTargetProfile,
    buildTargetProfileTraining,
    buildTargetProfileTube,
    buildTraining,
    buildTrainingTrigger,
    buildTrainingTriggerTube,
    buildUser,
    buildUserRecommendedTraining,
  } = databaseBuilder.factory;

  let targetProfileId;
  let trainingIds = [];
  if (combinedCourseData.targetProfile) {
    targetProfileId = buildTargetProfile({
      description: combinedCourseData.targetProfile.description,
      name: combinedCourseData.targetProfile.name,
    }).id;

    combinedCourseData.targetProfile.stages?.forEach((stage) => {
      buildStage({
        title: stage.title,
        threshold: stage.threshold,
        targetProfileId,
      });
    });

    combinedCourseData.targetProfile.tubes.forEach(({ id, level }) =>
      buildTargetProfileTube({
        targetProfileId,
        tubeId: id,
        level,
      }),
    );
  }

  const blueprintSuccessRequirements = combinedCourseData.blueprint.requirements.map((req) => {
    if (req.type === 'evaluation') {
      return CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId }).toDTO();
    }
    return CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: req.moduleId }).toDTO();
  });

  const { id: blueprintQuestId } = buildQuestForCombinedCourse({
    successRequirements: blueprintSuccessRequirements,
    rewardType: combinedCourseData.blueprint.rewardType ?? null,
    rewardId: combinedCourseData.blueprint.rewardId ?? null,
  });

  const { id: combinedCourseBlueprintId } = buildCombinedCourseBlueprint({
    name: combinedCourseData.blueprint.name,
    internalName: combinedCourseData.blueprint.internalName,
    description: combinedCourseData.blueprint.description,
    illustration: combinedCourseData.blueprint.illustration,
    questId: blueprintQuestId,
    surveyUrl: combinedCourseData.blueprint.surveyUrl,
    rewardRequirementsDescription: combinedCourseData.blueprint.rewardRequirementsDescription,
  });

  let campaignId;
  if (combinedCourseData.targetProfile) {
    const campaignData = combinedCourseData.targetProfile.campaign;
    campaignId = buildCampaign({
      targetProfileId,
      organizationId: combinedCourseData.organizationId,
      id: campaignData.id,
      name: campaignData.name,
      code: campaignData.code,
      customResultPageButtonText: campaignData.customResultPageButtonText,
      customResultPageButtonUrl: campaignData.customResultPageButtonUrl,
    }).id;

    campaignData.skills.forEach((skillId) =>
      buildCampaignSkill({
        campaignId,
        skillId,
      }),
    );

    trainingIds =
      combinedCourseData.targetProfile.trainings?.map((training) => {
        const { id: trainingId } = buildTraining(training);
        const { id: trainingTriggerId } = buildTrainingTrigger({
          trainingId,
          threshold: training.threshold ?? 0,
          type: training.triggerType ?? 'prerequisite',
        });

        combinedCourseData.targetProfile.tubes.forEach((tube) =>
          buildTrainingTriggerTube({ trainingTriggerId, tubeId: tube.id, level: tube.level }),
        );

        buildTargetProfileTraining({
          targetProfileId,
          trainingId,
        });

        return trainingId;
      }) ?? [];
  }

  const combinedCourseSuccessRequirements = combinedCourseData.blueprint.requirements.map((req) => {
    if (req.type === 'evaluation') {
      return CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId }).toDTO();
    }
    return CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId: req.moduleId }).toDTO();
  });

  const { id: combinedCourseQuestId } = buildQuestForCombinedCourse({
    successRequirements: combinedCourseSuccessRequirements,
    rewardType: combinedCourseData.blueprint.rewardType ?? null,
    rewardId: combinedCourseData.blueprint.rewardId ?? null,
  });

  const { id: combinedCourseId } = buildCombinedCourse({
    code: combinedCourseData.combinedCourse.code,
    name: combinedCourseData.combinedCourse.name ?? combinedCourseData.blueprint.name,
    organizationId: combinedCourseData.organizationId,
    combinedCourseBlueprintId,
    questId: combinedCourseQuestId,
    deletedAt: combinedCourseData.deletedAt,
    deletedBy: combinedCourseData.deletedBy,
    description: combinedCourseData.blueprint.description,
  });

  combinedCourseData.participations.forEach((participation) => {
    const { id: userId } = buildUser.withRawPassword({
      firstName: participation.firstName,
      lastName: participation.lastName,
      email: participation.email,
    });

    const { id: organizationLearnerId } = buildOrganizationLearner({
      firstName: participation.firstName,
      lastName: participation.lastName,
      group: participation.group,
      division: participation.division,
      userId,
      organizationId: combinedCourseData.organizationId,
    });

    buildOrganizationLearnerParticipation({
      combinedCourseId,
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      organizationLearnerId,
      status: participation.status,
    });

    if (combinedCourseData.targetProfile) {
      const { id: campaignParticipationId } = buildCampaignParticipation({
        campaignId,
        userId,
        organizationLearnerId,
        status: participation.campaignStatus,
      });

      buildAssessment({
        userId,
        courseId: null,
        state:
          participation.campaignStatus === CampaignParticipationStatuses.SHARED
            ? Assessment.states.COMPLETED
            : Assessment.states.STARTED,
        competenceId: null,
        lastQuestionState: null,
        type: Assessment.types.CAMPAIGN,
        campaignParticipationId,
      });

      if (participation.campaignStatus === CampaignParticipationStatuses.SHARED) {
        buildKnowledgeElementSnapshot({
          campaignParticipationId,
          userId,
        });

        if (combinedCourseData.targetProfile.stages) {
          buildStageAcquisition({
            stageId: combinedCourseData.targetProfile.stages[0].id,
            campaignParticipationId,
          });
        }

        trainingIds.forEach((trainingId) => {
          buildUserRecommendedTraining({ userId, trainingId, campaignParticipationId });
        });
      }
    }
  });
};

export const buildCombinedCourseBlueprints = () => {
  const combinedCourseBlueprintId = buildCombinedCourseBlueprint({
    name: 'Mon parcours combiné 2',
    internalName: 'Mon schéma de parcours combiné 2',
    illustration: 'https://assets.pix.org/combined-courses/illu_ia.svg',
    description:
      "#Un parcours\n pour découvrir l'essentiel sur l'intelligence artificielle : [comprendre sa définition](http://pix.fr), ses domaines d'application, comment elle fonctionne, ainsi que ses enjeux, notamment en matière d'impact environnemental.",
  }).id;

  buildCombinedCourseBlueprintShare({ combinedCourseBlueprintId, organizationId: PRO_ORGANIZATION_ID });
  buildCombinedCourseBlueprintShare({ combinedCourseBlueprintId, organizationId: SCO_ORGANIZATION_ID });
  buildCombinedCourseBlueprintShare({ combinedCourseBlueprintId, organizationId: SCO_MANAGING_ORGANIZATION_ID });
  buildCombinedCourseBlueprintShare({ combinedCourseBlueprintId, organizationId: SUP_ORGANIZATION_ID });
};

export const buildCombinedCourses = (databaseBuilder) => {
  [
    PRO_COMBINED_COURSE,
    COMBINED_COURSE_WITHOUT_CAMPAIGN,
    COMBINED_COURSE_WITHOUT_MODULES,
    MAXI_COMBINED_COURSE,
    SCO_SIECLE_COMBINED_COURSE,
    SUP_IMPORT_COMBINED_COURSE,
    PRO_MANAGING_COMBINED_COURSE,
  ].forEach((config) => {
    buildCombinixQuest(databaseBuilder, config);
  });
};
