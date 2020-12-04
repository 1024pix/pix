const usecases = require('../../domain/usecases');
const certificationIssueReportSerializer = require('../../infrastructure/serializers/jsonapi/certification-issue-report-serializer');

module.exports = {

  async saveCertificationIssueReport(request, h) {
    const certificationIssueReport = certificationIssueReportSerializer.deserialize(request);
    const certificationIssueReportSaved = await usecases.saveCertificationIssueReport({ certificationIssueReport });

    return h.response(certificationIssueReportSerializer.serialize(certificationIssueReportSaved)).created();
  }
};
