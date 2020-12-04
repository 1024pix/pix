const usecases = require('../../domain/usecases');
const certificationIssueReportSerializer = require('../../infrastructure/serializers/jsonapi/certification-issue-report-serializer');

module.exports = {

  async saveCertificationIssueReport(request, h) {
    const certificationIssueReport = certificationIssueReportSerializer.deserialize(request);
    await usecases.saveCertificationIssueReport({ certificationIssueReport });

    return h.response().created(); // on ne renvoie pas de certifIssueReport du coup ?
  }
};
