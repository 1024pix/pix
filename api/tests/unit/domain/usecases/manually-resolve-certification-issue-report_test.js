const { expect, sinon } = require('../../../test-helper');
const manuallyResolveCertificationIssueReport = require('../../../../lib/domain/usecases/manually-resolve-certification-issue-report');

describe('Unit | UseCase | manually-resolve-certification-issue-report', function () {
  it('should resolve and save certification issue report', async function () {
    // given
    const certificationIssueReportRepository = {
      get: sinon.stub(),
      save: sinon.stub(),
    };
    const resolution = 'issue solved';
    const certificationIssueReportId = 1;
    const expectedCertificationIssueReport = { resolve: sinon.stub() };
    certificationIssueReportRepository.get.resolves(expectedCertificationIssueReport);
    certificationIssueReportRepository.save.resolves(expectedCertificationIssueReport);

    // when
    await manuallyResolveCertificationIssueReport({
      resolution,
      certificationIssueReportRepository,
      certificationIssueReportId,
    });

    // then
    expect(certificationIssueReportRepository.get).to.have.been.called;
    expect(certificationIssueReportRepository.save).to.have.been.calledWith(expectedCertificationIssueReport);
    expect(expectedCertificationIssueReport.resolve).to.have.been.calledWith(resolution);
  });
});
