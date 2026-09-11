import { usecases } from '../domain/usecases/index.js';
import * as certificationIssueReportSerializer from '../infrastructure/serializers/certification-issue-report-serializer.js';

async function saveCertificationIssueReport(request, h) {
  const certificationIssueReportDTO = certificationIssueReportSerializer.deserialize(request);
  const certificationIssueReportSaved = await usecases.saveCertificationIssueReport({ certificationIssueReportDTO });

  return h.response(certificationIssueReportSerializer.serialize(certificationIssueReportSaved)).created();
}

async function abort(request, h) {
  const certificationCourseId = request.params.certificationCourseId;
  const abortReason = request.payload.data.reason;
  await usecases.abortCertificationCourse({ certificationCourseId, abortReason });
  return h.response().code(200);
}

export const certificationReportController = { saveCertificationIssueReport, abort };
