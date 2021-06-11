const CertificationIssueReportResolutionAttempt = require('./CertificationIssueReportResolutionAttempt');

module.exports = {
  NEUTRALIZE_IF_EMBED: async ({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository }) => {
    const questionNumber = certificationIssueReport.questionNumber;
    const recId = certificationAssessment.getChallengeRecIdByQuestionNumber(questionNumber);

    if (!recId) {
      return _resolveWithNoQuestionFoundWithQuestionNumber(certificationIssueReportRepository, certificationIssueReport, questionNumber);
    }

    const challenge = await challengeRepository.get(recId);

    if (!challenge.hasEmbed()) {
      return _resolveWithNoEmbedInChallenge(certificationIssueReportRepository, certificationIssueReport);
    }

    return _neutralizeAndResolve(certificationAssessment, certificationIssueReportRepository, certificationIssueReport);
  },

  NEUTRALIZE_IF_ILLUSTRATION: async ({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository }) => {
    const questionNumber = certificationIssueReport.questionNumber;
    const recId = certificationAssessment.getChallengeRecIdByQuestionNumber(questionNumber);

    if (!recId) {
      return _resolveWithNoQuestionFoundWithQuestionNumber(certificationIssueReportRepository, certificationIssueReport, questionNumber);
    }

    const challenge = await challengeRepository.get(recId);

    if (!challenge.hasIllustration()) {
      return _resolveWithNoImageInChallenge(certificationIssueReportRepository, certificationIssueReport);
    }

    return _neutralizeAndResolve(certificationAssessment, certificationIssueReportRepository, certificationIssueReport);
  },

  NEUTRALIZE_IF_ATTACHMENT: async ({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository }) => {
    const questionNumber = certificationIssueReport.questionNumber;
    const recId = certificationAssessment.getChallengeRecIdByQuestionNumber(questionNumber);

    if (!recId) {
      return _resolveWithNoQuestionFoundWithQuestionNumber(certificationIssueReportRepository, certificationIssueReport, questionNumber);
    }

    const challenge = await challengeRepository.get(recId);

    if (!challenge.hasAtLeastOneAttachment()) {
      return _resolveWithNoAttachmentInChallenge(certificationIssueReportRepository, certificationIssueReport);
    }

    return _neutralizeAndResolve(certificationAssessment, certificationIssueReportRepository, certificationIssueReport);
  },

  NEUTRALIZE_WITHOUT_CHECKING: async ({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository }) => {
    return _neutralizeAndResolve(certificationAssessment, certificationIssueReportRepository, certificationIssueReport);
  },

  NONE: async () => {
    return CertificationIssueReportResolutionAttempt.unresolved();
  },
};

function _neutralizeAndResolve(certificationAssessment, certificationIssueReportRepository, certificationIssueReport) {
  const questionNumber = certificationIssueReport.questionNumber;
  const neutralizationAttempt = certificationAssessment.neutralizeChallengeByNumberIfKoOrSkippedOrPartially(questionNumber);
  if (neutralizationAttempt.hasSucceeded()) {
    return _resolveWithQuestionNeutralized(certificationIssueReportRepository, certificationIssueReport);
  } else if (neutralizationAttempt.wasSkipped()) {
    return _resolveWithAnswerIsCorrect(certificationIssueReportRepository, certificationIssueReport);
  } else {
    return _resolveWithNoQuestionFoundWithQuestionNumber(certificationIssueReportRepository, certificationIssueReport, questionNumber);
  }
}

async function _resolveWithNoQuestionFoundWithQuestionNumber(certificationIssueReportRepository, certificationIssueReport, questionNumber) {
  certificationIssueReport.resolve(`Aucune question ne correspond au numéro ${questionNumber}`);
  await certificationIssueReportRepository.save(certificationIssueReport);
  return CertificationIssueReportResolutionAttempt.resolvedWithoutEffect();
}

async function _resolveWithQuestionNeutralized(certificationIssueReportRepository, certificationIssueReport) {
  certificationIssueReport.resolve('Cette question a été neutralisée automatiquement');
  await certificationIssueReportRepository.save(certificationIssueReport);
  return CertificationIssueReportResolutionAttempt.resolvedWithEffect();
}

async function _resolveWithNoImageInChallenge(certificationIssueReportRepository, certificationIssueReport) {
  certificationIssueReport.resolve('Cette question n\' a pas été neutralisée car elle ne contient pas d\'image');
  await certificationIssueReportRepository.save(certificationIssueReport);
  return CertificationIssueReportResolutionAttempt.resolvedWithoutEffect();
}

async function _resolveWithNoAttachmentInChallenge(certificationIssueReportRepository, certificationIssueReport) {
  certificationIssueReport.resolve('Cette question n\' a pas été neutralisée car elle ne contient pas de fichier à télécharger');
  await certificationIssueReportRepository.save(certificationIssueReport);
  return CertificationIssueReportResolutionAttempt.resolvedWithoutEffect();
}

async function _resolveWithNoEmbedInChallenge(certificationIssueReportRepository, certificationIssueReport) {
  certificationIssueReport.resolve('Cette question n\' a pas été neutralisée car elle ne contient pas d\'application/simulateur');
  await certificationIssueReportRepository.save(certificationIssueReport);
  return CertificationIssueReportResolutionAttempt.resolvedWithoutEffect();
}

async function _resolveWithAnswerIsCorrect(certificationIssueReportRepository, certificationIssueReport) {
  certificationIssueReport.resolve('Cette question n\'a pas été neutralisée car la réponse est correcte');
  await certificationIssueReportRepository.save(certificationIssueReport);
  return CertificationIssueReportResolutionAttempt.resolvedWithoutEffect();
}
