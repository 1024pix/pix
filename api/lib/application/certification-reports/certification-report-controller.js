const usecases = require('../../domain/usecases');
const certificationIssueReportSerializer = require('../../infrastructure/serializers/jsonapi/certification-issue-report-serializer');

module.exports = {

  async saveCertificationIssueReport(request, h) {
    const userId = request.auth.credentials.userId;
    const certificationIssueReportDTO = certificationIssueReportSerializer.deserialize(request);
    const certificationIssueReportSaved = await usecases.saveCertificationIssueReport({ userId, certificationIssueReportDTO });

    return h.response(certificationIssueReportSerializer.serialize(certificationIssueReportSaved)).created();
  },
};
