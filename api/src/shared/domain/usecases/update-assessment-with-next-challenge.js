import { logger } from '../../infrastructure/utils/logger.js';
import { AssessmentEndedError, AssessmentLackOfChallengesError, NotFoundError } from '../errors.js';

export async function updateAssessmentWithNextChallenge({
  assessmentId,
  userId,
  locale,
  evaluationUsecases,
  assessmentRepository,
  certificationEvaluationRepository,
  courseRepository,
  challengeRepository,
  competenceRepository,
  certificationChallengeLiveAlertRepository,
  certificationCompanionAlertRepository,
}) {
  const assessment = await assessmentRepository.getWithAnswers(assessmentId);
  let globalProgression = null;
  let nextChallenge = null;
  try {
    if (assessment.isCertification()) {
      const challengeLiveAlerts = await certificationChallengeLiveAlertRepository.getByAssessmentId({
        assessmentId: assessment.id,
      });
      const companionLiveAlerts = await certificationCompanionAlertRepository.getAllByAssessmentId({
        assessmentId: assessment.id,
      });
      assessment.attachLiveAlerts({ challengeLiveAlerts, companionLiveAlerts });
      if (assessment.isStarted()) {
        const nextChallengeId = await certificationEvaluationRepository.selectNextCertificationChallenge({
          assessmentId: assessment.id,
          locale,
        });
        nextChallenge = await challengeRepository.get(nextChallengeId);
      }
    }

    if (assessment.isPreview() && assessment.isStarted()) {
      nextChallenge = await evaluationUsecases.getNextChallengeForPreview({});
    }

    if (assessment.isDemo()) {
      const course = await courseRepository.get(assessment.courseId);
      if (!course.canBePlayed) {
        throw new NotFoundError("Le test demandé n'existe pas");
      }
      assessment.title = course.name;
      if (assessment.isStarted()) {
        nextChallenge = await evaluationUsecases.getNextChallengeForDemo({ assessment });
      }
    }

    if (assessment.isForCampaign() && assessment.isStarted()) {
      if (assessment.isForExamCampaign()) {
        const progression = await evaluationUsecases.getProgression({
          progressionId: assessmentId.toString(),
          userId,
        });
        globalProgression = progression.completionRate;
      }
      nextChallenge = await evaluationUsecases.getNextChallengeForCampaignAssessment({ assessment, locale });
    }
    if (assessment.isCompetenceEvaluation()) {
      assessment.title = await competenceRepository.getCompetenceName({ id: assessment.competenceId, locale });
      if (assessment.isStarted()) {
        nextChallenge = await evaluationUsecases.getNextChallengeForCompetenceEvaluation({
          assessment,
          userId,
          locale,
        });
      }
    }
  } catch (error) {
    if (error instanceof AssessmentLackOfChallengesError) {
      logger.warn(
        {
          assessmentId: assessment.id,
          numberOfAnswers: error.numberOfAnswers,
          maximumAssessmentLength: error.maximumAssessmentLength,
        },
        'Assessment ended prematurely: no challenge remaining before reaching maximum assessment length',
      );
      nextChallenge = null;
    } else if (error instanceof AssessmentEndedError) {
      nextChallenge = null;
    } else {
      logger.error(
        { assessmentId: assessment.id, assessmentType: assessment.type, err: error },
        'Unexpected error while retrieving next challenge for assessment',
      );
      throw error;
    }
  }

  if (nextChallenge) {
    await assessmentRepository.updateLastQuestionDate({ id: assessment.id, lastQuestionDate: new Date() });
  }
  if (nextChallenge && nextChallenge.id !== assessment.lastChallengeId) {
    await assessmentRepository.updateWhenNewChallengeIsAsked({
      id: assessment.id,
      lastChallengeId: nextChallenge.id,
    });
  }
  assessment.nextChallenge = nextChallenge;

  return {
    assessment,
    globalProgression,
  };
}
