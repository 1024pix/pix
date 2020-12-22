const usecases = require('../../domain/usecases');

module.exports = {
  async deleteCertificationIssueReport(request) {
    const userId = request.auth.credentials.userId;
    const certificationIssueReportId = parseInt(request.params.id);
    await usecases.deleteCertificationIssueReport({
      certificationIssueReportId,
      userId,
    });

    return null;
  },
};
