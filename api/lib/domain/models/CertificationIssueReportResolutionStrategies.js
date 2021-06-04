const CertificationIssueReportResolutionAttempt = require('./CertificationIssueReportResolutionAttempt');

module.exports = {
  NEUTRALIZE_IF_EMBED: async () => {
    return CertificationIssueReportResolutionAttempt.failure();
  },
  NEUTRALIZE_IF_IMAGE: async ({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository }) => {
    const questionNumber = certificationIssueReport.questionNumber;
    const recId = certificationAssessment.getChallengeRecIdByQuestionNumber(questionNumber);

    if (!recId) {
      return CertificationIssueReportResolutionAttempt.failure();
    }

    const challenge = await challengeRepository.get(recId);

    if (!challenge.illustrationUrl) {
      return CertificationIssueReportResolutionAttempt.failure();
    }

    const neutralizationAttempt = certificationAssessment.neutralizeChallengeByNumberIfKoOrSkipped(questionNumber);
    if (neutralizationAttempt.hasSucceeded()) {
      certificationIssueReport.resolve('Cette question a été neutralisée automatiquement');
      await certificationIssueReportRepository.save(certificationIssueReport);
      return CertificationIssueReportResolutionAttempt.succeeded();
    }
    return CertificationIssueReportResolutionAttempt.failure();
  },
  NEUTRALIZE_WITHOUT_CHECKING: async ({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository }) => {
    const questionNumber = certificationIssueReport.questionNumber;
    const neutralizationAttempt = certificationAssessment.neutralizeChallengeByNumberIfKoOrSkipped(questionNumber);
    if (neutralizationAttempt.hasSucceeded()) {
      certificationIssueReport.resolve('Cette question a été neutralisée automatiquement');
      await certificationIssueReportRepository.save(certificationIssueReport);
      return CertificationIssueReportResolutionAttempt.succeeded();
    }
    return CertificationIssueReportResolutionAttempt.failure();
  },
  NONE: async () => {
    return CertificationIssueReportResolutionAttempt.failure();
  },
};
