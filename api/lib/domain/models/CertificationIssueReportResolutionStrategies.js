const CertificationIssueReportResolutionAttempt = require('./CertificationIssueReportResolutionAttempt');

module.exports = {
  NEUTRALIZE_IF_EMBED: async () => {
    return CertificationIssueReportResolutionAttempt.failure();
  },
  NEUTRALIZE_IF_IMAGE: async () => {
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
