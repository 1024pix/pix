import { ChallengeAlreadyAnsweredError } from '../../../evaluation/domain/errors.js';
import { CertificationChallengeLiveAlert } from '../../../shared/domain/models/CertificationChallengeLiveAlert.js';

const createCertificationChallengeLiveAlert = async function ({
  assessmentId,
  challengeId,
  certificationChallengeLiveAlertRepository,
  answerRepository,
  challengeToPlayApi,
}) {
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

  const challengeToPlay = await challengeToPlayApi.get(challengeId);

  const certificationChallengeLiveAlert = new CertificationChallengeLiveAlert({
    assessmentId,
    challengeId,
    questionNumber,
    hasAttachment: challengeToPlay.hasAtLeastOneAttachment(),
    hasImage: challengeToPlay.hasIllustration(),
    hasEmbed: challengeToPlay.hasEmbed(),
    isFocus: challengeToPlay.isFocused(),
  });

  return certificationChallengeLiveAlertRepository.save({ certificationChallengeLiveAlert });
};

function _getCurrentQuestionNumber(answers) {
  return answers.length + 1;
}

export { createCertificationChallengeLiveAlert };
