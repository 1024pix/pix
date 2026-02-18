/**
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationEvaluationRepository} CertificationEvaluationRepository
 */
import { usecases as certificationUsecases } from '../../../certification/session-management/domain/usecases/index.js';
import { Answer } from '../../../evaluation/domain/models/Answer.js';
import { evaluationUsecases } from '../../../evaluation/domain/usecases/index.js';
import * as competenceEvaluationSerializer from '../../../evaluation/infrastructure/serializers/jsonapi/competence-evaluation-serializer.js';
import { usecases as questUsecases } from '../../../quest/domain/usecases/index.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { sharedUsecases } from '../../domain/usecases/index.js';
import { featureToggles } from '../../infrastructure/feature-toggles/index.js';
import * as assessmentRepository from '../../infrastructure/repositories/assessment-repository.js';
import * as assessmentSerializer from '../../infrastructure/serializers/jsonapi/assessment-serializer.js';
import { extractUserIdFromRequest, getChallengeLocale } from '../../infrastructure/utils/request-response-utils.js';

const save = async function (request, h, dependencies = { assessmentRepository }) {
  const assessment = assessmentSerializer.deserialize(request.payload);
  assessment.userId = extractUserIdFromRequest(request);
  assessment.state = 'started';
  const createdAssessment = await dependencies.assessmentRepository.save({ assessment });
  return h.response(assessmentSerializer.serialize(createdAssessment.toDto())).created();
};

const getAssessmentWithNextChallenge = async function (
  request,
  h,
  dependencies = { assessmentSerializer, extractUserIdFromRequest },
) {
  let globalProgression = null;
  const assessmentId = request.params.id;
  const locale = getChallengeLocale(request);
  const userId = dependencies.extractUserIdFromRequest(request);

  const enableTransactionForGetNext = await featureToggles.get('enableTransactionForGetNext');
  if (enableTransactionForGetNext) {
    const assessment = await DomainTransaction.execute(async () => {
      const assessmentWithoutChallenge = await sharedUsecases.getAssessment({ assessmentId, locale });

      if (assessmentWithoutChallenge?.campaign?.isExam) {
        const progression = await evaluationUsecases.getProgression({
          progressionId: assessmentId.toString(),
          userId,
        });
        globalProgression = progression.completionRate;
      }

      return sharedUsecases.updateAssessmentWithNextChallenge({
        assessment: assessmentWithoutChallenge,
        userId,
        locale,
      });
    });

    return dependencies.assessmentSerializer.serialize(assessment.toDto(globalProgression));
  }

  const assessmentWithoutChallenge = await sharedUsecases.getAssessment({ assessmentId, locale });

  if (assessmentWithoutChallenge?.campaign?.isExam) {
    const progression = await evaluationUsecases.getProgression({ progressionId: assessmentId.toString(), userId });
    globalProgression = progression.completionRate;
  }

  const assessment = await sharedUsecases.updateAssessmentWithNextChallenge({
    assessment: assessmentWithoutChallenge,
    userId,
    locale,
  });

  return dependencies.assessmentSerializer.serialize(assessment.toDto(globalProgression));
};

const updateLastChallengeState = async function (request) {
  const assessmentId = request.params.id;
  const lastQuestionState = request.params.state;
  const challengeId = request.payload?.data?.attributes?.['challenge-id'];

  await DomainTransaction.execute(async () => {
    await sharedUsecases.updateLastQuestionState({ assessmentId, challengeId, lastQuestionState });
  });

  return null;
};

const findCompetenceEvaluations = async function (request) {
  const userId = request.auth.credentials.userId;
  const assessmentId = request.params.id;

  const competenceEvaluations = await evaluationUsecases.findCompetenceEvaluationsByAssessment({
    userId,
    assessmentId,
  });

  return competenceEvaluationSerializer.serialize(competenceEvaluations);
};

const autoValidateNextChallenge = async function (request, h) {
  const assessmentId = request.params.id;
  const locale = getChallengeLocale(request);
  const assessment = await sharedUsecases.getAssessment({ assessmentId, locale });
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
    await evaluationUsecases.saveAndCorrectAnswerForCertification({
      answer: fakeAnswer,
      assessment,
      userId,
      locale,
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
};

const createCertificationChallengeLiveAlert = async function (request, h) {
  const assessmentId = request.params.id;
  const challengeId = request.payload?.data?.attributes?.['challenge-id'];
  await certificationUsecases.createCertificationChallengeLiveAlert({ assessmentId, challengeId });
  return h.response().code(204);
};

const assessmentController = {
  save,
  getAssessmentWithNextChallenge,
  updateLastChallengeState,
  findCompetenceEvaluations,
  autoValidateNextChallenge,
  createCertificationChallengeLiveAlert,
};

export { assessmentController };
