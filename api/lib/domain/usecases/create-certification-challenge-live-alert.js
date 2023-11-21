import { CertificationChallengeLiveAlert } from '../../../src/certification/session/domain/models/CertificationChallengeLiveAlert.js';

const createCertificationChallengeLiveAlert = async function ({
  assessmentId,
  challengeId,
  certificationChallengeLiveAlertRepository,
  answerRepository,
  challengeRepository,
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
