import { CompetenceEvaluation } from '../../../../../src/evaluation/domain/models/CompetenceEvaluation.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';
import { sharedUsecases } from '../../../../../src/shared/domain/usecases/index.js';
import * as tooling from '../../common/tooling/index.js';
import { ASSESSMENT_CAMPAIGN_PIX_ID, SCO_ORGANIZATION_ID, TEAM_EVALUATION_OFFSET_ID } from '../constants.js';

const USER_ID = TEAM_EVALUATION_OFFSET_ID + 3;
const ANSWERED_AT = new Date('2026-01-10');
const CAMPAIGN_ANSWER_COUNT = 3;
const FAILED_ANSWER_INTERVAL = 4;

// One answer out of four is failed, so that some tubes get a ceiling.
const buildAnswerAndKnowledgeElement = (databaseBuilder, userId, assessmentId, { answerData, keData }, index) => {
  const { buildAnswer, buildKnowledgeElement } = databaseBuilder.factory;
  const isFailed = index % FAILED_ANSWER_INTERVAL === FAILED_ANSWER_INTERVAL - 1;

  const answerId = buildAnswer({
    assessmentId,
    ...answerData,
    result: isFailed ? 'ko' : 'ok',
    createdAt: ANSWERED_AT,
    updatedAt: ANSWERED_AT,
  }).id;
  buildKnowledgeElement({
    assessmentId,
    userId,
    answerId,
    ...keData,
    status: isFailed ? KnowledgeElement.StatusType.INVALIDATED : KnowledgeElement.StatusType.VALIDATED,
    earnedPix: isFailed ? 0 : keData.earnedPix,
    createdAt: ANSWERED_AT,
  });
};

// The participation is left started: the user can go on answering, as a migrated user.
const buildStartedCampaignParticipation = (
  databaseBuilder,
  userId,
  organizationLearnerId,
  answersAndKnowledgeElements,
) => {
  const { buildCampaignParticipation, buildAssessment } = databaseBuilder.factory;

  const campaignParticipationId = buildCampaignParticipation({
    campaignId: ASSESSMENT_CAMPAIGN_PIX_ID,
    userId,
    organizationLearnerId,
    status: 'STARTED',
    sharedAt: null,
    createdAt: ANSWERED_AT,
  }).id;
  const assessmentId = buildAssessment({
    userId,
    type: Assessment.types.CAMPAIGN,
    state: Assessment.states.STARTED,
    campaignParticipationId,
    createdAt: ANSWERED_AT,
  }).id;

  answersAndKnowledgeElements.forEach((answerAndKnowledgeElement, index) =>
    buildAnswerAndKnowledgeElement(databaseBuilder, userId, assessmentId, answerAndKnowledgeElement, index),
  );
};

const buildCompetenceEvaluations = (databaseBuilder, userId, answersAndKnowledgeElements) => {
  const { buildAssessment, buildCompetenceEvaluation } = databaseBuilder.factory;
  const answersAndKnowledgeElementsByCompetenceId = Map.groupBy(
    answersAndKnowledgeElements,
    ({ keData }) => keData.competenceId,
  );

  for (const [competenceId, competenceAnswers] of answersAndKnowledgeElementsByCompetenceId) {
    const assessmentId = buildAssessment({
      userId,
      competenceId,
      type: Assessment.types.COMPETENCE_EVALUATION,
      state: Assessment.states.STARTED,
      createdAt: ANSWERED_AT,
    }).id;
    buildCompetenceEvaluation({
      userId,
      competenceId,
      assessmentId,
      status: CompetenceEvaluation.statuses.STARTED,
    });

    competenceAnswers.forEach((answerAndKnowledgeElement, index) =>
      buildAnswerAndKnowledgeElement(databaseBuilder, userId, assessmentId, answerAndKnowledgeElement, index),
    );
  }
};

/**
 * A user with answers and knowledge elements, migrated to knowledge states by
 * the migration use case itself.
 */
const initUser = async (databaseBuilder) => {
  const { buildUser, buildOrganizationLearner } = databaseBuilder.factory;

  const user = buildUser.withRawPassword({
    id: USER_ID,
    firstName: 'User migrated to knowledge states',
    lastName: 'Team Eval',
    email: 'migrated-to-ks@example.net',
    cgu: true,
    lang: 'fr',
    lastTermsOfServiceValidatedAt: new Date(),
    mustValidateTermsOfService: false,
    pixCertifTermsOfServiceAccepted: false,
    hasSeenAssessmentInstructions: true,
  });
  const organizationLearner = buildOrganizationLearner({
    userId: user.id,
    organizationId: SCO_ORGANIZATION_ID,
  });

  const answersAndKnowledgeElements = await tooling.profile.getAnswersAndKnowledgeElementsForBeginnerProfile();
  const campaignAnswers = answersAndKnowledgeElements.slice(0, CAMPAIGN_ANSWER_COUNT);
  const competenceEvaluationAnswers = answersAndKnowledgeElements.slice(CAMPAIGN_ANSWER_COUNT);

  buildStartedCampaignParticipation(databaseBuilder, user.id, organizationLearner.id, campaignAnswers);
  buildCompetenceEvaluations(databaseBuilder, user.id, competenceEvaluationAnswers);

  // The migration reads the knowledge elements of the user in the database.
  await databaseBuilder.commit();
  await sharedUsecases.migrateUserToKnowledgeStates({ userId: user.id });
};

export default initUser;
