import { ChallengeAlreadyAnsweredError } from '../../../evaluation/domain/errors.js';
import { CertificationChallengeLiveAlert } from '../../../shared/domain/models/CertificationChallengeLiveAlert.js';
import { answerRepository as injectedAnswerRepository } from '../../infrastructure/repositories/index.js';
import { challengeRepository as injectedChallengeRepository } from '../../infrastructure/repositories/index.js';

const createCertificationChallengeLiveAlert = async function ({
  assessmentId,
  challengeId,
  certificationChallengeLiveAlertRepository,
  answerRepository = injectedAnswerRepository,
  challengeRepository = injectedChallengeRepository,
} = {}) {
  const unhandledCertificationChallengeLiveAlert =
    await certificationChallengeLiveAlertRepository.getOngoingByChallengeIdAndAssessmentId({
      challengeId,
      assessmentId,
    });

  if (unhandledCertificationChallengeLiveAlert) {
    return;
  }

  const answers = await answerRepository.findByAssessment(assessmentId);

  const isCurrentChallengeAlreadyAnswered = Boolean(
    answers.find(({ challengeId: currentChallengeId }) => currentChallengeId === challengeId),
  );

  if (isCurrentChallengeAlreadyAnswered) {
    throw new ChallengeAlreadyAnsweredError();
  }

  const questionNumber = _getCurrentQuestionNumber(answers);

  const { attachments, embedUrl, illustrationUrl, focused } = await challengeRepository.get(challengeId);

  const certificationChallengeLiveAlert = new CertificationChallengeLiveAlert({
    assessmentId,
    challengeId,
    questionNumber,
    hasAttachment: attachments?.length > 0,
    hasImage: illustrationUrl?.length > 0,
    hasEmbed: embedUrl?.length > 0,
    isFocus: focused,
  });

  return certificationChallengeLiveAlertRepository.save({ certificationChallengeLiveAlert });
};

function _getCurrentQuestionNumber(answers) {
  return answers.length + 1;
}

export { createCertificationChallengeLiveAlert };
