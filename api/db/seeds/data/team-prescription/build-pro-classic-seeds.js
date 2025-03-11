import dayjs from 'dayjs';

import { usecases as libUsecases } from '../../../../lib/domain/usecases/index.js';
import { Answer } from '../../../../src/evaluation/domain/models/Answer.js';
import { evaluationUsecases } from '../../../../src/evaluation/domain/usecases/index.js';
import { usecases as cpUsecases } from '../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import {
  CampaignExternalIdTypes,
  CampaignParticipationStatuses,
} from '../../../../src/prescription/shared/domain/constants.js';
import { assessmentController } from '../../../../src/shared/application/assessments/assessment-controller.js';
import * as assessmentRepository from '../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import { PRO_ORGANIZATION_ID, USER_ID_ADMIN_ORGANIZATION } from '../common/constants.js';
import { createAssessmentCampaign, createProfilesCollectionCampaign } from '../common/tooling/campaign-tooling.js';
import { createProfileGivenCompetences } from '../common/tooling/profile-tooling.js';
import { TARGET_PROFILE_BADGES_STAGES_ID, TARGET_PROFILE_NO_BADGES_NO_STAGES_ID } from './constants.js';

async function createProCampaignProfileCollection(databaseBuilder) {
  const { campaignId } = await createProfilesCollectionCampaign({
    databaseBuilder,
    organizationId: PRO_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    name: 'Campagne de collecte de profil PRO',
    code: 'PROCOLMUL',
    externalIdLabel: 'Mets ton adresse mail',
    externalIdType: CampaignExternalIdTypes.EMAIL,
    createdAt: dayjs().subtract(30, 'days').toDate(),
    multipleSendings: true,
  });

  const jeanBonUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Jean',
    lastName: 'Bon',
    username: null,
    email: 'jean.bon@prescription.com',
  });

  const jeanBonOrganizationLearner = databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner(
    {
      firstName: jeanBonUser.firstName,
      lastName: jeanBonUser.lastName,
      deletedAt: null,
      createdAt: dayjs().subtract(15, 'days').toDate(),
      isDisabled: false,
      userId: jeanBonUser.id,
      organizationId: PRO_ORGANIZATION_ID,
    },
  );

  // ke before being a learner
  await createProfileGivenCompetences({
    databaseBuilder,
    userId: jeanBonUser.id,
    competenceToPick: 1,
    createdAt: dayjs().subtract(16, 'days').toDate(),
  });

  // build snapshot for given learner
  const jeanBonCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
    userId: jeanBonUser.id,
    participantExternalId: jeanBonUser.email,
    organizationLearnerId: jeanBonOrganizationLearner.id,
    campaignId,
    status: CampaignParticipationStatuses.TO_SHARE,
    deletedAt: null,
    createdAt: dayjs().subtract(10, 'days').toDate(),
  }).id;

  await databaseBuilder.commit();
  await cpUsecases.shareCampaignResult({
    userId: jeanBonUser.id,
    campaignParticipationId: jeanBonCampaignParticipationId,
  });
}

async function createProAssessmentMultipleSendingsCampaign(databaseBuilder) {
  const { campaignId } = await createAssessmentCampaign({
    databaseBuilder,
    organizationId: PRO_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    name: "Campagne d'évaluation PRO",
    code: 'PROASSMUL',
    externalIdLabel: 'Mets ton adresse mail',
    externalIdType: CampaignExternalIdTypes.EMAIL,
    createdAt: dayjs().subtract(30, 'days').toDate(),
    multipleSendings: true,
    targetProfileId: TARGET_PROFILE_NO_BADGES_NO_STAGES_ID,
  });

  const tristeTempsUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Triste',
    lastName: 'Temps',
    username: null,
    email: 'triste.temps@prescription.com',
  });

  // ke before being a learner
  await createProfileGivenCompetences({
    databaseBuilder,
    userId: tristeTempsUser.id,
    competenceToPick: 1,
    createdAt: dayjs().subtract(16, 'days').toDate(),
  });

  await databaseBuilder.commit();

  // create campaign participation & assessment
  const participation = await _buildCampaignParticipation({
    userId: tristeTempsUser.id,
    campaignId,
    participantExternalId: tristeTempsUser.email,
  });

  // loop to build answer like a real participant
  await _createAnswerForParticipant({ assessment: participation.assessment, userId: tristeTempsUser.id });

  // after this share campaign to orgnization
  await cpUsecases.shareCampaignResult({
    userId: tristeTempsUser.id,
    campaignParticipationId: participation.campaignParticipationId,
  });
}

async function _buildCampaignParticipation({ userId, participantExternalId, campaignId }) {
  await cpUsecases.startCampaignParticipation({
    campaignParticipation: { campaignId, participantExternalId },
    userId,
  });

  // get participation and lastAssessment
  const campaignParticipation = await cpUsecases.getUserCampaignParticipationToCampaign({
    userId,
    campaignId,
  });

  const assessment = await assessmentRepository.get(campaignParticipation.lastAssessment.id);

  return { assessment, campaignParticipationId: campaignParticipation.id };
}

async function _createAnswerForParticipant({ assessment, userId }) {
  //Some logic are in the controller directly instead of usecase, so we cannot use directly get next challenge usecase
  let nextChallenge = await assessmentController.getNextChallenge({ params: { id: assessment.id } });

  // auto validate ok
  while (nextChallenge.data !== null) {
    await assessmentRepository.updateWhenNewChallengeIsAsked({
      id: assessment.id,
      lastChallengeId: nextChallenge.data.id,
    });
    const fakeAnswer = new Answer({
      assessmentId: assessment.id,
      challengeId: nextChallenge.data.id,
      value: 'FAKE_ANSWER_WITH_AUTO_VALIDATE_NEXT_CHALLENGE',
    });
    await evaluationUsecases.saveAndCorrectAnswerForCampaign({
      answer: fakeAnswer,
      assessment,
      userId,
      forceOKAnswer: true,
    });
    nextChallenge = await assessmentController.getNextChallenge({ params: { id: assessment.id } });
  }

  await libUsecases.completeAssessment({ assessmentId: assessment.id });
}

async function createProAssessmentCampaign(databaseBuilder) {
  const { campaignId } = await createAssessmentCampaign({
    databaseBuilder,
    organizationId: PRO_ORGANIZATION_ID,
    ownerId: USER_ID_ADMIN_ORGANIZATION,
    name: "Campagne d'évaluation PRO",
    code: 'PROASSIMP',
    externalIdLabel: 'Mets ton identifiant',
    externalIdType: CampaignExternalIdTypes.EMAIL,
    createdAt: dayjs().subtract(30, 'days').toDate(),
    multipleSendings: false,
    targetProfileId: TARGET_PROFILE_BADGES_STAGES_ID,
  });
  const beauTempsUser = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Beau',
    lastName: 'Temps',
    username: null,
    email: 'beau.temps@prescription.com',
  });

  // ke before being a learner
  await createProfileGivenCompetences({
    databaseBuilder,
    userId: beauTempsUser.id,
    competenceToPick: 1,
    createdAt: dayjs().subtract(16, 'days').toDate(),
  });

  // create campaign participation & assessment
  const participation = await _buildCampaignParticipation({
    userId: beauTempsUser.id,
    campaignId,
    participantExternalId: beauTempsUser.email,
  });

  // loop to build answer like a real participant
  await _createAnswerForParticipant({ assessment: participation.assessment, userId: beauTempsUser.id });
}

export { createProAssessmentCampaign, createProAssessmentMultipleSendingsCampaign, createProCampaignProfileCollection };
