const usecases = require('../../domain/usecases');

module.exports = {
  async deleteCertificationIssueReport(request) {
    const userId = request.auth.credentials.userId;
    const certificationIssueReportId = request.params.id;
    await usecases.deleteCertificationIssueReport({
      certificationIssueReportId,
      userId,
    });

    return null;
  },

  async manuallyResolve(request, h) {
    const certificationIssueReportId = request.params.id;
    const resolution = request.payload.data.resolution;
    await usecases.manuallyResolveCertificationIssueReport({
      certificationIssueReportId,
      resolution,
    });

    return h.response().code(204);
  },
};
