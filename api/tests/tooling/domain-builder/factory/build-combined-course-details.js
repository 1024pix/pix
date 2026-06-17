import { Campaign } from '../../../../src/quest/domain/models/Campaign.js';
import { CombinedCourseBlueprint } from '../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { CombinedCourseDetails } from '../../../../src/quest/domain/models/combined-course-participations/aggregates/CombinedCourseDetails.js';
import { CombinedCourse } from '../../../../src/quest/domain/models/combined-courses/entities/CombinedCourse.js';
import { Module } from '../../../../src/quest/domain/models/Module.js';
import { DataForQuest } from '../../../../src/quest/domain/models/quests/aggregates/DataForQuest.js';
import { Eligibility } from '../../../../src/quest/domain/models/quests/aggregates/Eligibility.js';
import { Quest } from '../../../../src/quest/domain/models/quests/entities/Quest.js';

function buildCombinedCourse({ name, code, organizationId, questId, baseSurveyUrl } = {}) {
  return new CombinedCourse({
    id: 1,
    code: code ?? 'COMBINIX1',
    organizationId: organizationId ?? 3,
    name: name ?? 'Mon parcours',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    illustration: '/illustrations/image.svg',
    questId: questId ?? 777,
    baseSurveyUrl,
  });
}

function buildCombinedCourseDetails({
  name,
  code,
  organizationId,
  questId,
  combinedCourseItems,
  cryptoService,
  rewardId = null,
  rewardType = null,
  baseSurveyUrl,
} = {}) {
  const combinedCourse = buildCombinedCourse({ name, code, organizationId, questId, baseSurveyUrl });

  const campaigns = [];
  const modules = [];
  const successRequirementsFromContents = combinedCourseItems.map((content) => {
    if (content.campaignId) {
      campaigns.push(
        new Campaign({
          id: content.campaignId,
          title: 'diagnostique' + content.campaignId,
          code: 'ABCDIAG' + content.campaignId,
          organizationId: combinedCourse.organizationId,
          targetProfileId: content.targetProfileId ?? 666,
        }),
      );
    } else if (content.moduleId) {
      modules.push(
        new Module({
          id: content.moduleId,
          slug: 'slug' + content.moduleId,
          title: 'title' + content.moduleId,
          duration: 10,
          version: '',
          image: 'emile' + content.moduleId,
          shortId: 'short-' + content.moduleId,
        }),
      );
    }

    return CombinedCourseBlueprint.buildRequirementForCombinedCourse(content).toDTO();
  });

  const quest = new Quest({
    id: combinedCourse.questId,
    rewardId,
    rewardType,
    eligibilityRequirements: [],
    successRequirements: successRequirementsFromContents,
  });

  const combinedCourseDetails = new CombinedCourseDetails(combinedCourse, quest, cryptoService);
  combinedCourseDetails.setItems({ campaigns, modules });

  return combinedCourseDetails;
}

function buildCombinedCourseDataForQuest({ passages, campaignParticipations }) {
  return new DataForQuest({
    eligibility: new Eligibility({
      campaignParticipations: campaignParticipations ?? [],
      passages: passages ?? [],
    }),
  });
}

export { buildCombinedCourse, buildCombinedCourseDataForQuest, buildCombinedCourseDetails };
