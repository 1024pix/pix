import _ from 'lodash';
import dayjs from 'dayjs';
import * as learningContent from './learning-content.js';
import * as profileTooling from './profile-tooling.js';
import * as generic from './generic.js';
import { CampaignParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { getPlacementProfile } from '../../../../../lib/domain/services/placement-profile-service.js';
import { KnowledgeElement } from '../../../../../lib/domain/models/KnowledgeElement.js';

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
 * @param configCampaign
 * {
 *  participantCount: number,
 *  completionDistribution: {
 *    started: number,
 *    to_share: number,
 *    shared: number,
 *    shared_one_validated_skill: number,
 *    shared_perfect: number,
 *  }
 * }
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
  const completionDistribution = [
    ...Array(configCampaign.completionDistribution?.started || 0).fill('STARTED'),
    ...Array(configCampaign.completionDistribution?.to_share || 0).fill('TO_SHARE'),
    ...Array(configCampaign.completionDistribution?.shared || 0).fill('SHARED'),
    ...Array(configCampaign.completionDistribution?.shared_one_validated_skill || 0).fill('SHARED_ONE_VALIDATED_SKILL'),
    ...Array(configCampaign.completionDistribution?.shared_perfect || 0).fill('SHARED_PERFECT'),
  ];

  if (completionDistribution.length < configCampaign.participantCount)
    completionDistribution.push(
      ...Array(configCampaign.participantCount - completionDistribution.length).fill('SHARED'),
    );
  const { realCampaignId, realOrganizationId, realCreatedAt } = _buildCampaign({
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

  const campaignSkills = await _buildCampaignSkills({
    databaseBuilder,
    campaignId: realCampaignId,
    targetProfileId,
  });

  const badgeIds = await databaseBuilder.knex('badges').pluck('id').where({ targetProfileId });

  const userAndLearnerIds = await _createOrRetrieveUsersAndLearners(
    databaseBuilder,
    realOrganizationId,
    configCampaign.participantCount,
  );

  for (const { userId, organizationLearnerId } of userAndLearnerIds) {
    const createdDate = dayjs(realCreatedAt)
      .add(_.random(0, _numberOfDaysBetweenNowAndCreationDate(realCreatedAt)), 'days')
      .toDate();
    const sharedDate = dayjs(createdDate)
      .add(_.random(0, _numberOfDaysBetweenNowAndCreationDate(createdDate)), 'days')
      .toDate();

    const { status, answersAndKnowledgeElements, validatedSkillsCount, masteryRate, pixScore, buildBadges } =
      await _getCompletionCampaignParticipationData(completionDistribution.shift(), campaignSkills, sharedDate);

    const isStarted = status === CampaignParticipationStatuses.STARTED;
    const isShared = status === CampaignParticipationStatuses.SHARED;
    const sharedAt = isShared ? sharedDate : null;

    const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
      campaignId: realCampaignId,
      userId,
      organizationLearnerId,
      sharedAt,
      createdAt: createdDate,
      validatedSkillsCount,
      masteryRate,
      pixScore,
      status,
      isImproved: false,
      isCertifiable: null,
    }).id;

    const assessmentId = databaseBuilder.factory.buildAssessment({
      userId,
      type: Assessment.types.CAMPAIGN,
      createdAt: createdDate,
      state: isStarted ? Assessment.states.STARTED : Assessment.states.COMPLETED,
      isImproving: false,
      lastQuestionDate: new Date(),
      lastQuestionState: isStarted ? null : Assessment.statesOfLastQuestion.ASKED,
      competenceId: null,
      campaignParticipationId,
    }).id;
    const keDataForSnapshot = [];

    for (const { answerData, keData } of answersAndKnowledgeElements) {
      const answerId = databaseBuilder.factory.buildAnswer({
        assessmentId,
        answerData,
        createdAt: createdDate,
      }).id;

      keDataForSnapshot.push(
        databaseBuilder.factory.buildKnowledgeElement({
          assessmentId,
          answerId,
          userId,
          ...keData,
          createdAt: dayjs(sharedDate).subtract(1, 'day'),
        }),
      );
    }

    if (!isStarted && buildBadges) {
      for (const badgeId of badgeIds) {
        databaseBuilder.factory.buildBadgeAcquisition({
          badgeId,
          userId,
          campaignParticipationId,
        });
      }
    }

    if (isShared) {
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        userId,
        snappedAt: sharedAt,
        snapshot: JSON.stringify(keDataForSnapshot),
      });
    }
  }

  await databaseBuilder.commit();
  return { campaignId: realCampaignId };
}

function _numberOfDaysBetweenNowAndCreationDate(date) {
  return dayjs().diff(date, 'day');
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
  sharedAt = new Date(),
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
    ...Array(configCampaign.profileDistribution.blank || 0).fill('BLANK'),
    ...Array(configCampaign.profileDistribution.beginner || 0).fill('BEGINNER'),
    ...Array(configCampaign.profileDistribution.intermediate || 0).fill('INTERMEDIATE'),
    ...Array(configCampaign.profileDistribution.advanced || 0).fill('ADVANCED'),
    ...Array(configCampaign.profileDistribution.perfect || 0).fill('PERFECT'),
  ];
  if (profileDistribution.length < configCampaign.participantCount)
    profileDistribution.push(...Array(configCampaign.participantCount - profileDistribution.length).fill('BEGINNER'));

  for (const { userId, organizationLearnerId } of userAndLearnerIds) {
    const answersAndKnowledgeElementsForProfile = await _getProfile(profileDistribution.shift());

    const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
      campaignId: realCampaignId,
      userId,
      organizationLearnerId,
      sharedAt,
      masteryRate: null,
      pixScore: _.floor(_.sumBy(answersAndKnowledgeElementsForProfile, ({ keData }) => keData.earnedPix)),
      status: CampaignParticipationStatuses.SHARED,
      isImproved: false,
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

    await databaseBuilder.commit();
    const placementProfile = await getPlacementProfile({ userId, limitDate: sharedAt });

    await databaseBuilder
      .knex('campaign-participations')
      .where('id', campaignParticipationId)
      .update('isCertifiable', placementProfile.isCertifiable());
  }
  await databaseBuilder.commit();
  return { campaignId: realCampaignId };
}

async function _buildCampaignSkills({ databaseBuilder, campaignId, targetProfileId }) {
  const skills = [];
  const cappedTubes = await databaseBuilder
    .knex('target-profile_tubes')
    .select('tubeId', 'level')
    .where({ targetProfileId });

  for (const cappedTube of cappedTubes) {
    const skillsForTube = await learningContent.findActiveSkillsByTubeId(cappedTube.tubeId);
    const skillsCapped = skillsForTube.filter((skill) => skill.level <= parseInt(cappedTube.level));
    skillsCapped.forEach((skill) => {
      skills.push(skill);
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: skill.id });
    });
  }

  return skills;
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
  const {
    id: realCampaignId,
    organizationId: realOrganizationId,
    createdAt: realCreatedAt,
  } = databaseBuilder.factory.buildCampaign({
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
  return { realCampaignId, realOrganizationId, realCreatedAt };
}

let emailIndex = 0;

async function _createOrRetrieveUsersAndLearners(databaseBuilder, organizationId, requiredParticipantCount) {
  const userAndLearnerIds = [];

  const result = await databaseBuilder
    .knex('organizations')
    .select('type', 'isManagingStudents')
    .where({ id: organizationId })
    .first();
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
  const groups = ['1ere A', '2nde B', 'Terminale C'];
  const divisions = ['3eme A', '4eme A', '5eme A', '6eme A', '3eme B', '4eme B', '5eme B', '6eme B'];
  for (let i = 0; i < learnersCountToCreate; ++i) {
    let division = null,
      group = null,
      studentNumber = null,
      nationalStudentId = null;

    if (result.type === 'SCO' && result.isManagingStudents) {
      division = divisions[emailIndex + (i % divisions.length)];
      nationalStudentId = emailIndex + '_SCO';
    } else if (result.type === 'SUP' && result.isManagingStudents) {
      group = groups[emailIndex + (i % groups.length)];
      studentNumber = emailIndex + '_SUP';
    }

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
      division,
      group,
      studentNumber,
      nationalStudentId,
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
  switch (profileName) {
    case 'BEGINNER':
      answersAndKnowledgeElements = await profileTooling.getAnswersAndKnowledgeElementsForBeginnerProfile();
      break;
    case 'INTERMEDIATE':
      answersAndKnowledgeElements = await profileTooling.getAnswersAndKnowledgeElementsForIntermediateProfile();
      break;
    case 'ADVANCED':
      answersAndKnowledgeElements = await profileTooling.getAnswersAndKnowledgeElementsForAdvancedProfile();
      break;
    case 'PERFECT':
      answersAndKnowledgeElements = await profileTooling.getAnswersAndKnowledgeElementsForPerfectProfile();
      break;
    default:
      answersAndKnowledgeElements = [];
  }
  return answersAndKnowledgeElements;
}

async function _getCompletionCampaignParticipationData(completionName, campaignSkills) {
  let answersAndKnowledgeElements,
    status,
    computedScore,
    validatedSkillsCount = 0,
    masteryRate = 0,
    buildBadges = false,
    pixScore = 0;

  const randomValidatedSkill = generic.pickOneRandomAmong(_.range(campaignSkills.length));

  switch (completionName) {
    case 'STARTED':
      answersAndKnowledgeElements = [];
      status = CampaignParticipationStatuses.STARTED;
      break;
    case 'TO_SHARE':
      answersAndKnowledgeElements = await _getKnowledgeElementFromSkills(campaignSkills, randomValidatedSkill);
      status = CampaignParticipationStatuses.TO_SHARE;
      break;
    case 'SHARED':
      answersAndKnowledgeElements = await _getKnowledgeElementFromSkills(campaignSkills, randomValidatedSkill);
      status = CampaignParticipationStatuses.SHARED;
      buildBadges = randomValidatedSkill > campaignSkills.length / 2;

      computedScore = _getCampaignParticipationResults(answersAndKnowledgeElements);
      validatedSkillsCount = computedScore.validatedSkillsCount;
      pixScore = computedScore.pixScore;
      masteryRate = computedScore.masteryRate;
      break;
    case 'SHARED_ONE_VALIDATED_SKILL':
      answersAndKnowledgeElements = await _getKnowledgeElementFromSkills(campaignSkills, 1);
      status = CampaignParticipationStatuses.SHARED;

      computedScore = _getCampaignParticipationResults(answersAndKnowledgeElements);
      validatedSkillsCount = computedScore.validatedSkillsCount;
      pixScore = computedScore.pixScore;
      masteryRate = computedScore.masteryRate;
      break;
    case 'SHARED_PERFECT':
      answersAndKnowledgeElements = await _getKnowledgeElementFromSkills(campaignSkills, campaignSkills.length);
      status = CampaignParticipationStatuses.SHARED;
      buildBadges = true;

      computedScore = _getCampaignParticipationResults(answersAndKnowledgeElements);
      validatedSkillsCount = computedScore.validatedSkillsCount;
      pixScore = computedScore.pixScore;
      masteryRate = computedScore.masteryRate;
      break;
  }

  return {
    status,
    answersAndKnowledgeElements,
    validatedSkillsCount,
    masteryRate,
    pixScore,
    buildBadges,
  };
}

function _getCampaignParticipationResults(answersAndKnowledgeElements) {
  const validatedSkills = answersAndKnowledgeElements.filter(({ keData }) => keData.status === 'validated');

  const pixScore = _.floor(_.sumBy(validatedSkills, ({ keData }) => keData.earnedPix));
  const validatedSkillsCount = validatedSkills.length;
  const masteryRate = validatedSkillsCount / answersAndKnowledgeElements.length;

  return { pixScore, validatedSkillsCount, masteryRate };
}

async function _getKnowledgeElementFromSkills(skills, validatedSkill = 0) {
  const answersAndKnowledgeElements = [];
  const orderedSkills = _.sortBy(skills, 'level');

  let i = 0;
  for (const skill of orderedSkills) {
    const isOk = i < validatedSkill;

    const challenge = await learningContent.findFirstValidatedChallengeBySkillId(skill.id);
    const answerData = {
      value: 'dummy value',
      result: isOk ? 'ok' : 'ko',
      challengeId: challenge.id,
      timeout: null,
      resultDetails: 'dummy value',
    };

    const keData = {
      source: 'direct',
      status: isOk ? KnowledgeElement.StatusType.VALIDATED : KnowledgeElement.StatusType.INVALIDATED,
      skillId: skill.id,
      earnedPix: isOk ? skill.pixValue : 0,
      competenceId: skill.competenceId,
    };
    answersAndKnowledgeElements.push({ answerData, keData });
    i++;
  }

  return answersAndKnowledgeElements;
}
