import { evaluationUsecases as injectedEvaluationUsecases } from '../../../evaluation/domain/usecases/index.js';
import * as injectedAssessmentRepository from '../../infrastructure/repositories/assessment-repository.js';
export async function updateAssessmentWithNextChallenge({
  assessment,
  userId,
  locale,
  assessmentRepository = injectedAssessmentRepository,
  evaluationUsecases = injectedEvaluationUsecases,
  certificationEvaluationRepository,
} = {}) {
  if (!assessment.isStarted()) {
    assessment.nextChallenge = null;
    return assessment;
  }
  await assessmentRepository.updateLastQuestionDate({ id: assessment.id, lastQuestionDate: new Date() });

  let nextChallenge = null;
  try {
    if (assessment.isCertification()) {
      nextChallenge = await certificationEvaluationRepository.selectNextCertificationChallenge({
        assessmentId: assessment.id,
        locale,
      });
    }

    if (assessment.isPreview()) {
      nextChallenge = await evaluationUsecases.getNextChallengeForPreview({});
    }

    if (assessment.isDemo()) {
      nextChallenge = await evaluationUsecases.getNextChallengeForDemo({ assessment });
    }

    if (assessment.isForCampaign()) {
      nextChallenge = await evaluationUsecases.getNextChallengeForCampaignAssessment({ assessment, locale });
    }
    if (assessment.isCompetenceEvaluation()) {
      nextChallenge = await evaluationUsecases.getNextChallengeForCompetenceEvaluation({ assessment, userId, locale });
    }
  } catch {
    nextChallenge = null;
  }

  if (nextChallenge && nextChallenge.id !== assessment.lastChallengeId) {
    await assessmentRepository.updateWhenNewChallengeIsAsked({
      id: assessment.id,
      lastChallengeId: nextChallenge.id,
    });
  }
  assessment.nextChallenge = nextChallenge;

  return assessment;
}
