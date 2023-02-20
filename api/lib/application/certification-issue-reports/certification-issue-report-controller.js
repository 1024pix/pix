import usecases from '../../domain/usecases';

export default {
  async deleteCertificationIssueReport(request) {
    const certificationIssueReportId = request.params.id;
    await usecases.deleteCertificationIssueReport({ certificationIssueReportId });

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
