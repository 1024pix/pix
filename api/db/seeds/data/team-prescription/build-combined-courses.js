import { CampaignParticipationStatuses } from '../../../../src/prescription/shared/domain/constants.js';
import { CombinedCourseBlueprint } from '../../../../src/quest/domain/models/CombinedCourseBlueprint.js';
import { OrganizationLearnerParticipationTypes } from '../../../../src/quest/domain/models/OrganizationLearnerParticipation.js';
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
import { SCO_SIECLE_COMBINED_COURSE } from './fixtures/sco-siecle-combined-course.js';
import { SUP_IMPORT_COMBINED_COURSE } from './fixtures/sup-import-combined-course.js';

const buildCombinixQuest = (databaseBuilder, combinedCourseData) => {
  const {
    buildAssessment,
    buildCampaign,
    buildCampaignParticipation,
    buildCampaignSkill,
    buildCombinedCourse,
    buildKnowledgeElementSnapshot,
    buildOrganizationLearner,
    buildOrganizationLearnerParticipation,
    buildStage,
    buildStageAcquisition,
    buildTargetProfile,
    buildTargetProfileTraining,
    buildTargetProfileTube,
    buildTraining,
    buildTrainingTrigger,
    buildTrainingTriggerTube,
    buildUser,
  } = databaseBuilder.factory;

  // Build combined course quest
  const { id: combinedCourseId } = buildCombinedCourse({
    ...combinedCourseData.quest,
    organizationId: combinedCourseData.organizationId,
  });

  // Build target profile if needed
  if (combinedCourseData.targetProfile) {
    // Build target profile
    const { id: targetProfileId } = buildTargetProfile({
      description: combinedCourseData.targetProfile.description,
      name: combinedCourseData.targetProfile.name,
    });

    // Build stages if any
    combinedCourseData.targetProfile.stages?.forEach((stage) => {
      buildStage({
        title: stage.title,
        threshold: stage.threshold,
        targetProfileId,
      });
    });

    // Build target profile tubes
    combinedCourseData.targetProfile.tubes.forEach(({ id, level }) =>
      buildTargetProfileTube({
        targetProfileId,
        tubeId: id,
        level,
      }),
    );

    // Build campaign
    buildCampaign({
      targetProfileId,
      organizationId: combinedCourseData.organizationId,
      id: combinedCourseData.targetProfile.campaign.id,
      name: combinedCourseData.targetProfile.campaign.name,
      code: combinedCourseData.targetProfile.campaign.code,
      customResultPageButtonText: combinedCourseData.targetProfile.campaign.customResultPageButtonText,
      customResultPageButtonUrl: combinedCourseData.targetProfile.campaign.customResultPageButtonUrl,
    });

    // Build campaign skills
    combinedCourseData.targetProfile.campaign.skills.forEach((skillId) =>
      buildCampaignSkill({
        campaignId: combinedCourseData.targetProfile.campaign.id,
        skillId,
      }),
    );

    // Build trainings if any
    combinedCourseData.targetProfile.trainings?.map((training) => {
      // Build training
      const { id: trainingId } = buildTraining(training);
      // Build training trigger
      const { id: trainingTriggerId } = buildTrainingTrigger({
        trainingId,
        threshold: training.threshold ?? 0,
        type: 'prerequisite',
      });

      // Build training trigger tubes
      combinedCourseData.targetProfile.tubes.forEach((tube) =>
        buildTrainingTriggerTube({ trainingTriggerId, tubeId: tube.id, level: tube.level }),
      );

      // Attach training to target profile
      buildTargetProfileTraining({
        targetProfileId,
        trainingId,
      });
    });
  }

  // Build participations if any
  combinedCourseData.participations.forEach((participation) => {
    // Build user
    const { id: userId } = buildUser.withRawPassword({
      firstName: participation.firstName,
      lastName: participation.lastName,
      email: participation.email,
    });

    // Build organization learner
    const { id: organizationLearnerId } = buildOrganizationLearner({
      firstName: participation.firstName,
      lastName: participation.lastName,
      group: participation.group,
      division: participation.division,
      userId,
      organizationId: combinedCourseData.organizationId,
    });

    // Build organization learner participation
    buildOrganizationLearnerParticipation({
      combinedCourseId,
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      organizationLearnerId,
      status: participation.status,
    });

    // Build campaign participation and assessment if target profile exists
    if (combinedCourseData.targetProfile) {
      // Build campaign participation
      const { id: campaignParticipationId } = buildCampaignParticipation({
        campaignId: combinedCourseData.targetProfile.campaign.id,
        userId,
        organizationLearnerId,
        status: participation.campaignStatus,
      });

      // Build assessment
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

      // If the campaign participation is shared, build knowledge elements and stage acquisitions
      if (participation.campaignStatus === CampaignParticipationStatuses.SHARED) {
        // Build knowledge element snapshot for this user
        buildKnowledgeElementSnapshot({
          campaignParticipationId,
          userId,
        });

        // Build stage 0 acquisition if there are stages
        if (combinedCourseData.targetProfile.stages) {
          buildStageAcquisition({
            stageId: combinedCourseData.targetProfile.stages[0].id,
            campaignParticipationId,
          });
        }
      }
    }
  });
};

export const buildCombinedCourseBlueprints = (databaseBuilder) => {
  const targetProfileId = databaseBuilder.factory.buildTargetProfile({
    name: 'Mon profil cible de parcours combiné',
  }).id;
  const moduleShortId = '27d6ca4f';

  const combinedCourseBlueprintId = buildCombinedCourseBlueprint({
    name: 'Mon parcours combiné 2',
    internalName: 'Mon schéma de parcours combiné 2',
    content: CombinedCourseBlueprint.buildContentItems([{ targetProfileId }, { moduleShortId }]),
    illustration: 'https://assets.pix.org/combined-courses/illu_ia.svg',
    description:
      "Un parcours pour découvrir l’essentiel sur l'intelligence artificielle : comprendre sa définition, ses domaines d'application, comment elle fonctionne, ainsi que ses enjeux, notamment en matière d'impact environnemental.",
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
  ].forEach((config) => {
    buildCombinixQuest(databaseBuilder, config);
  });
};
