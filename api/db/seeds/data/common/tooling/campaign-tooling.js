import _ from 'lodash';
import dayjs from 'dayjs';
import * as learningContent from './learning-content.js';
import * as profileTooling from './profile-tooling.js';
import * as generic from './generic.js';
import { CampaignParticipationStatuses } from '../../../../../lib/domain/models/CampaignParticipationStatuses.js';
import { Assessment } from '../../../../../lib/domain/models/Assessment.js';

export { createAssessmentCampaign, createProfilesCollectionCampaign };

/**
 * Fonction générique pour créer une campagne d'évaluation selon une configuration donnée.
 * Retourne l'ID de la campagne.
 *
 * @param {DatabaseBuilder} databaseBuilder
 * @param {number} campaignId
 * @param {string} name
 * @param {string} code
 * @param {string} title
 * @param {string} idPixLabel
 * @param {string} externalIdHelpImageUrl
 * @param {string} alternativeTextToExternalIdHelpImage
 * @param {string} customLandingPageText
 * @param {boolean} isForAbsoluteNovice
 * @param {Date} archivedAt
 * @param {number} archivedBy
 * @param {Date} createdAt
 * @param {number} organizationId
 * @param {number} creatorId
 * @param {number} ownerId
 * @param {number} targetProfileId
 * @param {string} customResultPageText
 * @param {string} customResultPageButtonText
 * @param {string} customResultPageButtonUrl
 * @param {boolean} multipleSendings
 * @param {string} assessmentMethod
 * @param configCampaign { participantCount: number }
 * @returns {Promise<{campaignId: number}>}
 */
async function createAssessmentCampaign({
  databaseBuilder,
  campaignId,
  name,
  code,
  title,
  idPixLabel,
  externalIdHelpImageUrl,
  alternativeTextToExternalIdHelpImage,
  customLandingPageText,
  isForAbsoluteNovice,
  archivedAt,
  archivedBy,
  createdAt,
  organizationId,
  creatorId,
  ownerId,
  targetProfileId,
  customResultPageText,
  customResultPageButtonText,
  customResultPageButtonUrl,
  multipleSendings,
  assessmentMethod,
  configCampaign,
}) {
  const { realCampaignId, realOrganizationId } = _buildCampaign({
    databaseBuilder,
    campaignId,
    name,
    code,
    title,
    idPixLabel,
    externalIdHelpImageUrl,
    alternativeTextToExternalIdHelpImage,
    customLandingPageText,
    isForAbsoluteNovice,
    archivedAt,
    archivedBy,
    type: 'ASSESSMENT',
    createdAt,
    organizationId,
    creatorId,
    ownerId,
    targetProfileId,
    customResultPageText,
    customResultPageButtonText,
    customResultPageButtonUrl,
    multipleSendings,
    assessmentMethod,
  });
  const cappedTubes = await databaseBuilder
    .knex('target-profile_tubes')
    .select('tubeId', 'level')
    .where({ targetProfileId });
  let skillCount = 0;
  for (const cappedTube of cappedTubes) {
    const skillsForTube = await learningContent.findActiveSkillsByTubeId(cappedTube.tubeId);
    const skillsCapped = skillsForTube.filter((skill) => skill.level <= parseInt(cappedTube.level));
    skillCount += skillsCapped.length;
    skillsCapped.map((skill) =>
      databaseBuilder.factory.buildCampaignSkill({ campaignId: realCampaignId, skillId: skill.id }),
    );
  }
  const badgeIds = await databaseBuilder.knex('badges').pluck('id').where({ targetProfileId });

  const userAndLearnerIds = await _createOrRetrieveUsersAndLearners(
    databaseBuilder,
    realOrganizationId,
    configCampaign.participantCount,
  );

  const answersAndKnowledgeElementsForProfile = await _getProfile('PERFECT');
  const sharedAt = new Date();
  let i = 0;
  for (const { userId, organizationLearnerId } of userAndLearnerIds) {
    const isPerfect = Boolean(i % 2);
    const hasValidatedOneSkill = isPerfect ? false : generic.pickOneRandomAmong([true, false]);
    let validatedSkillsCount = 0,
      masteryRate = 0,
      pixScore = 0;
    if (isPerfect) {
      validatedSkillsCount = answersAndKnowledgeElementsForProfile.length;
      masteryRate = 1;
      pixScore = _.floor(_.sumBy(answersAndKnowledgeElementsForProfile, ({ keData }) => keData.earnedPix));
    }
    if (hasValidatedOneSkill) {
      validatedSkillsCount = 1;
      masteryRate = 1 / skillCount;
      pixScore = _.floor(answersAndKnowledgeElementsForProfile[0].keData.earnedPix);
    }
    const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
      campaignId,
      userId,
      organizationLearnerId,
      sharedAt,
      validatedSkillsCount,
      masteryRate,
      pixScore,
      status: CampaignParticipationStatuses.SHARED,
      isImproved: false,
      isCertifiable: true,
    }).id;
    const assessmentId = databaseBuilder.factory.buildAssessment({
      userId,
      type: Assessment.types.CAMPAIGN,
      state: Assessment.states.COMPLETED,
      isImproving: false,
      lastQuestionDate: new Date(),
      lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
      competenceId: null,
      campaignParticipationId,
    }).id;
    const keDataForSnapshot = [];
    if (isPerfect) {
      for (const { answerData, keData } of answersAndKnowledgeElementsForProfile) {
        const answerId = databaseBuilder.factory.buildAnswer({
          assessmentId,
          answerData,
        }).id;
        keDataForSnapshot.push(
          databaseBuilder.factory.buildKnowledgeElement({
            assessmentId,
            answerId,
            userId,
            ...keData,
            createdAt: dayjs().subtract(1, 'day'),
          }),
        );
      }
      for (const badgeId of badgeIds) {
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId,
          userId,
          campaignParticipationId,
        });
      }
    } else if (hasValidatedOneSkill) {
      const { answerData, keData } = answersAndKnowledgeElementsForProfile[0];
      const answerId = databaseBuilder.factory.buildAnswer({
        assessmentId,
        answerData,
      }).id;
      keDataForSnapshot.push(
        databaseBuilder.factory.buildKnowledgeElement({
          assessmentId,
          answerId,
          userId,
          ...keData,
          createdAt: dayjs().subtract(1, 'day'),
        }),
      );
    }
    databaseBuilder.factory.buildKnowledgeElementSnapshot({
      userId,
      snappedAt: sharedAt,
      snapshot: JSON.stringify(keDataForSnapshot),
    });
    ++i;
  }

  await databaseBuilder.commit();
  return { campaignId: realCampaignId };
}

/**
 * Fonction générique pour créer une campagne de collecte de profils selon une configuration donnée.
 * Retourne l'ID de la campagne.
 *
 * @param {DatabaseBuilder} databaseBuilder
 * @param {number} campaignId
 * @param {string} name
 * @param {string} code
 * @param {string} title
 * @param {string} idPixLabel
 * @param {string} externalIdHelpImageUrl
 * @param {string} alternativeTextToExternalIdHelpImage
 * @param {string} customLandingPageText
 * @param {boolean} isForAbsoluteNovice
 * @param {Date} archivedAt
 * @param {number} archivedBy
 * @param {Date} createdAt
 * @param {number} organizationId
 * @param {number} creatorId
 * @param {number} ownerId
 * @param {string} customResultPageText
 * @param {string} customResultPageButtonText
 * @param {string} customResultPageButtonUrl
 * @param {boolean} multipleSendings
 * @param {string} assessmentMethod
 * @param configCampaign { participantCount: number, profileDistribution: { beginner: number, intermediate: number, advanced: number, perfect: number } }
 * @returns {Promise<{campaignId: number}>}
 */
async function createProfilesCollectionCampaign({
  databaseBuilder,
  campaignId,
  name,
  code,
  title,
  idPixLabel,
  externalIdHelpImageUrl,
  alternativeTextToExternalIdHelpImage,
  customLandingPageText,
  isForAbsoluteNovice,
  archivedAt,
  archivedBy,
  createdAt,
  organizationId,
  creatorId,
  ownerId,
  customResultPageText,
  customResultPageButtonText,
  customResultPageButtonUrl,
  multipleSendings,
  assessmentMethod,
  configCampaign,
}) {
  const { realCampaignId, realOrganizationId } = _buildCampaign({
    databaseBuilder,
    campaignId,
    name,
    code,
    title,
    idPixLabel,
    externalIdHelpImageUrl,
    alternativeTextToExternalIdHelpImage,
    customLandingPageText,
    isForAbsoluteNovice,
    archivedAt,
    archivedBy,
    type: 'PROFILES_COLLECTION',
    createdAt,
    organizationId,
    creatorId,
    ownerId,
    targetProfileId: null,
    customResultPageText,
    customResultPageButtonText,
    customResultPageButtonUrl,
    multipleSendings,
    assessmentMethod,
  });
  const userAndLearnerIds = await _createOrRetrieveUsersAndLearners(
    databaseBuilder,
    realOrganizationId,
    configCampaign.participantCount,
  );
  const profileDistribution = [
    ...Array(configCampaign.profileDistribution.beginner || 0).fill('BEGINNER'),
    ...Array(configCampaign.profileDistribution.intermediate || 0).fill('INTERMEDIATE'),
    ...Array(configCampaign.profileDistribution.advanced || 0).fill('ADVANCED'),
    ...Array(configCampaign.profileDistribution.perfect || 0).fill('PERFECT'),
  ];
  if (profileDistribution.length < configCampaign.participantCount)
    profileDistribution.push(...Array(configCampaign.participantCount - profileDistribution.length).fill('BEGINNER'));

  const sharedAt = new Date();
  for (const { userId, organizationLearnerId } of userAndLearnerIds) {
    const answersAndKnowledgeElementsForProfile = await _getProfile(profileDistribution.shift());
    await profileTooling.getAnswersAndKnowledgeElementsForBeginnerProfile();
    const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
      campaignId,
      userId,
      organizationLearnerId,
      sharedAt,
      validatedSkillsCount: answersAndKnowledgeElementsForProfile.length,
      masteryRate: 1,
      pixScore: _.floor(_.sumBy(answersAndKnowledgeElementsForProfile, ({ keData }) => keData.earnedPix)),
      status: CampaignParticipationStatuses.SHARED,
      isImproved: false,
      isCertifiable: true,
    }).id;
    const assessmentId = databaseBuilder.factory.buildAssessment({
      userId,
      type: Assessment.types.CAMPAIGN,
      state: Assessment.states.COMPLETED,
      isImproving: false,
      lastQuestionDate: new Date(),
      lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
      competenceId: null,
      campaignParticipationId,
    }).id;
    const keDataForSnapshot = [];
    for (const { answerData, keData } of answersAndKnowledgeElementsForProfile) {
      const answerId = databaseBuilder.factory.buildAnswer({
        assessmentId,
        answerData,
      }).id;
      keDataForSnapshot.push(
        databaseBuilder.factory.buildKnowledgeElement({
          assessmentId,
          answerId,
          userId,
          ...keData,
          createdAt: dayjs().subtract(1, 'day'),
        }),
      );
    }
    databaseBuilder.factory.buildKnowledgeElementSnapshot({
      userId,
      snappedAt: sharedAt,
      snapshot: JSON.stringify(keDataForSnapshot),
    });
  }
  await databaseBuilder.commit();
  return { campaignId: realCampaignId };
}

function _buildCampaign({
  databaseBuilder,
  campaignId,
  name,
  code,
  title,
  idPixLabel,
  externalIdHelpImageUrl,
  alternativeTextToExternalIdHelpImage,
  customLandingPageText,
  isForAbsoluteNovice,
  archivedAt,
  archivedBy,
  type,
  createdAt,
  organizationId,
  creatorId,
  ownerId,
  targetProfileId,
  customResultPageText,
  customResultPageButtonText,
  customResultPageButtonUrl,
  multipleSendings,
  assessmentMethod,
}) {
  const { id: realCampaignId, organizationId: realOrganizationId } = databaseBuilder.factory.buildCampaign({
    id: campaignId,
    name,
    code,
    title,
    idPixLabel,
    externalIdHelpImageUrl,
    alternativeTextToExternalIdHelpImage,
    customLandingPageText,
    isForAbsoluteNovice,
    archivedAt,
    archivedBy,
    type,
    createdAt,
    organizationId,
    creatorId,
    ownerId,
    targetProfileId,
    customResultPageText,
    customResultPageButtonText,
    customResultPageButtonUrl,
    multipleSendings,
    assessmentMethod,
  });
  return { realCampaignId, realOrganizationId };
}

let emailIndex = 0;
async function _createOrRetrieveUsersAndLearners(databaseBuilder, organizationId, requiredParticipantCount) {
  const userAndLearnerIds = [];

  const existingReconciliatedOrganizationLearnerIds = await databaseBuilder
    .knex('view-active-organization-learners')
    .select({
      organizationLearnerId: 'id',
      userId: 'userId',
    })
    .where({ organizationId })
    .whereNotNull('userId')
    .limit(requiredParticipantCount);
  userAndLearnerIds.push(...existingReconciliatedOrganizationLearnerIds);
  const learnersCountToCreate = requiredParticipantCount - userAndLearnerIds.length;
  const divisions = ['1ere A', '2nde B', 'Terminale C'];
  for (let i = 0; i < learnersCountToCreate; ++i) {
    const userId = databaseBuilder.factory.buildUser.withRawPassword({
      firstName: `first-name${emailIndex}`,
      lastName: `last-name${emailIndex}`,
      email: `learneremail${organizationId}_${emailIndex}@example.net`,
      cgu: true,
      lastTermsOfServiceValidatedAt: new Date(),
      mustValidateTermsOfService: false,
      hasSeenAssessmentInstructions: true,
      shouldChangePassword: false,
    }).id;
    const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
      firstName: `first-name${emailIndex}`,
      lastName: `last-name${emailIndex}`,
      sex: 'M',
      birthdate: '2000-01-01',
      birthCity: null,
      birthCityCode: '75115',
      birthCountryCode: '100',
      birthProvinceCode: null,
      division: divisions[emailIndex + (i % divisions.length)],
      isDisabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      organizationId,
      userId,
    }).id;
    userAndLearnerIds.push({ userId, organizationLearnerId });
    emailIndex++;
  }
  return userAndLearnerIds;
}

async function _getProfile(profileName) {
  let answersAndKnowledgeElements;
  if (profileName === 'BEGINNER')
    answersAndKnowledgeElements = await profileTooling.getAnswersAndKnowledgeElementsForBeginnerProfile();
  if (profileName === 'INTERMEDIATE')
    answersAndKnowledgeElements = await profileTooling.getAnswersAndKnowledgeElementsForIntermediateProfile();
  if (profileName === 'ADVANCED')
    answersAndKnowledgeElements = await profileTooling.getAnswersAndKnowledgeElementsForAdvancedProfile();
  if (profileName === 'PERFECT')
    answersAndKnowledgeElements = await profileTooling.getAnswersAndKnowledgeElementsForPerfectProfile();
  return answersAndKnowledgeElements;
}
