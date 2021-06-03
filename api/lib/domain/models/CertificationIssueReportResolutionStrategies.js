module.exports = {
  NEUTRALIZE_IF_EMBED: 'NEUTRALIZE_IF_EMBED',
  NEUTRALIZE_IF_IMAGE: 'NEUTRALIZE_IF_IMAGE',
  NEUTRALIZE_WITHOUT_CHECKING: async ({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository }) => {
    const questionNumber = certificationIssueReport.questionNumber;
    const neutralizationAttempt = certificationAssessment.neutralizeChallengeByNumberIfKoOrSkipped(questionNumber);
    if (neutralizationAttempt.hasSucceeded()) {
      certificationIssueReport.resolve('Cette question a été neutralisée automatiquement');
      await certificationIssueReportRepository.save(certificationIssueReport);
      return true;
    }
    return false;
  },
  NONE: 'NONE',
};
