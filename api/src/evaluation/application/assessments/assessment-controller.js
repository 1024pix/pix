import * as certificationEvaluationApi from '../../../certification/evaluation/application/api/certification-evaluation-api.js';
import { usecases as devcompUsecases } from '../../../devcomp/domain/usecases/index.js';
import { usecases as prescriptionUsecases } from '../../../prescription/campaign-participation/domain/usecases/index.js';
import { stageUsecases } from '../../../prescription/stages/domain/usecases/index.js';
import { usecases as profileUsecases } from '../../../profile/domain/usecases/index.js';
import { usecases as questUsecases } from '../../../quest/domain/usecases/index.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { AssessmentDtoFactory } from '../../../shared/domain/models/AssessmentDtoFactory.js';
import { featureToggles } from '../../../shared/infrastructure/feature-toggles/index.js';
import * as assessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import { assessmentSerializer } from '../../../shared/infrastructure/serializers/jsonapi/assessment-serializer.js';
import * as llmChatSerializer from '../../../shared/infrastructure/serializers/llm-chat-serializer.js';
import {
  extractUserIdFromRequest,
  getChallengeLocale,
} from '../../../shared/infrastructure/utils/request-response-utils.js';
import { Answer } from '../../domain/models/Answer.js';
import { evaluationUsecases } from '../../domain/usecases/index.js';
import { competenceEvaluationSerializer } from '../../infrastructure/serializers/jsonapi/competence-evaluation-serializer.js';

async function shareProfileRewardWithOrganization(campaignParticipationId, userId) {
  const questResults = await questUsecases.getQuestResultsForCampaignParticipation({
    userId,
    campaignParticipationId,
  });

  for (const questResult of questResults) {
    if (questResult.profileRewardId) {
      await profileUsecases.shareProfileReward({
        userId,
        profileRewardId: questResult.profileRewardId,
        campaignParticipationId,
      });
    }
  }
}

async function completeAssessment(request) {
  const assessmentId = request.params.id;
  const locale = getChallengeLocale(request);
  return DomainTransaction.execute(async () => {
    const assessment = await evaluationUsecases.completeAssessment({ assessmentId, locale });

    await evaluationUsecases.handleBadgeAcquisition({ assessment });
    await stageUsecases.handleStageAcquisition({ assessment });

    const isQuestEnabled = await featureToggles.get('isQuestEnabled');

    if (assessment.userId && assessment.isCampaignParticipationAvailable()) {
      await prescriptionUsecases.shareCampaignResult({
        userId: assessment.userId,
        campaignParticipationId: assessment.campaignParticipationId,
      });
    }

    if (assessment.userId && isQuestEnabled) {
      await questUsecases.rewardUser({ userId: assessment.userId });
    }

    if (assessment.userId && assessment.isCampaignParticipationAvailable() && isQuestEnabled) {
      await shareProfileRewardWithOrganization(assessment.campaignParticipationId, assessment.userId);
    }

    await devcompUsecases.handleTrainingRecommendation({ assessment, locale });

    return null;
  });
}

async function startEmbedLlmChat(request, h, { usecases } = { usecases: evaluationUsecases }) {
  const { configId } = request.payload;
  const userId = request.auth.credentials.userId;
  const assessmentId = request.params.assessmentId;
  const startedChatDTO = await usecases.startEmbedLlmChat({ configId, userId, assessmentId });
  return h.response(llmChatSerializer.serialize(startedChatDTO)).code(201);
}

async function promptToLLMChat(request, h, { usecases } = { usecases: evaluationUsecases }) {
  const { assessmentId, chatId } = request.params;
  const { prompt, attachmentName } = request.payload;
  const userId = request.auth.credentials.userId;
  const llmResponse = await usecases.promptToLLMChat({ assessmentId, chatId, userId, prompt, attachmentName });
  return h.response(llmResponse).type('text/event-stream').code(201);
}

async function save(request, h, dependencies = { assessmentRepository }) {
  const assessment = assessmentSerializer.deserialize(request.payload);
  assessment.userId = extractUserIdFromRequest(request);
  assessment.state = 'started';
  const createdAssessment = await dependencies.assessmentRepository.save({ assessment });
  const assessmentDto = AssessmentDtoFactory.toDto(createdAssessment);
  return h.response(assessmentSerializer.serialize(assessmentDto)).created();
}

async function autoValidateNextChallenge(request, h) {
  const assessmentId = request.params.id;
  const locale = getChallengeLocale(request);
  const assessment = await assessmentRepository.getWithAnswers(assessmentId);
  const userId = assessment.userId;
  const fakeAnswer = new Answer({
    assessmentId,
    challengeId: assessment.lastChallengeId,
    value: 'FAKE_ANSWER_WITH_AUTO_VALIDATE_NEXT_CHALLENGE',
  });
  if (assessment.isCompetenceEvaluation()) {
    await evaluationUsecases.saveAndCorrectAnswerForCompetenceEvaluation({
      answer: fakeAnswer,
      assessment,
      userId,
      locale,
      forceOKAnswer: true,
    });
  } else if (assessment.isForCampaign()) {
    await evaluationUsecases.saveAndCorrectAnswerForCampaign({
      answer: fakeAnswer,
      assessment,
      userId,
      locale,
      forceOKAnswer: true,
    });
  } else if (assessment.isCertification()) {
    await certificationEvaluationApi.evaluateAndSaveAnswer({
      answer: fakeAnswer,
      userId,
      certificationCourseId: assessment.certificationCourseId,
      forceOKAnswer: true,
    });
  } else {
    await evaluationUsecases.saveAndCorrectAnswerForDemoAndPreview({
      answer: fakeAnswer,
      assessment,
      userId,
      locale,
      forceOKAnswer: true,
    });
  }
  await questUsecases.rewardUser({ userId });
  return h.response().code(204);
}

async function updateLastChallengeState(request) {
  const assessmentId = request.params.id;
  const lastQuestionState = request.params.state;
  const challengeId = request.payload?.data?.attributes?.['challenge-id'];

  await DomainTransaction.execute(async () => {
    await evaluationUsecases.updateLastQuestionState({ assessmentId, challengeId, lastQuestionState });
  });

  return null;
}

async function findCompetenceEvaluations(request) {
  const userId = request.auth.credentials.userId;
  const assessmentId = request.params.id;

  const competenceEvaluations = await evaluationUsecases.findCompetenceEvaluationsByAssessment({
    userId,
    assessmentId,
  });

  return competenceEvaluationSerializer.serialize(competenceEvaluations);
}

const assessmentController = {
  completeAssessment,
  promptToLLMChat,
  startEmbedLlmChat,
  save,
  autoValidateNextChallenge,
  updateLastChallengeState,
  findCompetenceEvaluations,
};

export { assessmentController };
