import { CertificationChallengeLiveAlert } from '../../../src/certification/session/domain/models/CertificationChallengeLiveAlert.js';

const createCertificationChallengeLiveAlert = async function ({
  assessmentId,
  challengeId,
  certificationChallengeLiveAlertRepository,
  answerRepository,
}) {
  const answers = await answerRepository.findByAssessment(assessmentId);

  const questionNumber = _getCurrentQuestionNumber(answers);

  const certificationChallengeLiveAlert = new CertificationChallengeLiveAlert({
    assessmentId,
    challengeId,
    questionNumber,
  });

  return certificationChallengeLiveAlertRepository.save({ certificationChallengeLiveAlert });
};

function _getCurrentQuestionNumber(answers) {
  return answers.length + 1;
}

export { createCertificationChallengeLiveAlert };
