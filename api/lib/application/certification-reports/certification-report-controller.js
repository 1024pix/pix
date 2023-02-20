import usecases from '../../domain/usecases';
import certificationIssueReportSerializer from '../../infrastructure/serializers/jsonapi/certification-issue-report-serializer';

export default {
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
