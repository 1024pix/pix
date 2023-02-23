const usecases = require('../../domain/usecases/index.js');
const certificationIssueReportSerializer = require('../../infrastructure/serializers/jsonapi/certification-issue-report-serializer.js');

module.exports = {
  async saveCertificationIssueReport(request, h) {
    const certificationIssueReportDTO = certificationIssueReportSerializer.deserialize(request);
    const certificationIssueReportSaved = await usecases.saveCertificationIssueReport({ certificationIssueReportDTO });

    return h.response(certificationIssueReportSerializer.serialize(certificationIssueReportSaved)).created();
  },

  async abort(request, h) {
    const certificationCourseId = request.params.id;
    const abortReason = request.payload.data.reason;
    await usecases.abortCertificationCourse({ certificationCourseId, abortReason });
    return h.response().code(200);
  },
};
