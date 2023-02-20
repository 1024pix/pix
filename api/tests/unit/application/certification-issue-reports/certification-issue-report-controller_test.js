import { sinon, expect, hFake } from '../../../test-helper';
import certificationIssueReportController from '../../../../lib/application/certification-issue-reports/certification-issue-report-controller';
import usecases from '../../../../lib/domain/usecases';

describe('Unit | Controller | certification-issue-report-controller', function () {
  describe('#deleteCertificationIssueReport', function () {
    it('should proceed to deletion', async function () {
      // given
      const certificationIssueReportId = 456;
      const userId = 789;
      sinon.stub(usecases, 'deleteCertificationIssueReport');

      // when
      const response = await certificationIssueReportController.deleteCertificationIssueReport(
        {
          params: {
            id: certificationIssueReportId,
          },
          auth: {
            credentials: { userId },
          },
        },
        hFake
      );

      // then
      expect(response).to.be.null;
      expect(usecases.deleteCertificationIssueReport).to.have.been.calledWith({ certificationIssueReportId });
    });
  });

  describe('#manuallyResolve', function () {
    it('should resolve certification issue report', async function () {
      // given
      const request = {
        params: {
          id: 100,
        },
        payload: {
          data: {
            resolution: 'resolved',
          },
        },
      };
      const manuallyResolveCertificationIssueReportStub = sinon.stub(
        usecases,
        'manuallyResolveCertificationIssueReport'
      );
      manuallyResolveCertificationIssueReportStub.resolves();

      // when
      const response = await certificationIssueReportController.manuallyResolve(request, hFake);

      // then
      expect(response.statusCode).to.deep.equal(204);
      expect(manuallyResolveCertificationIssueReportStub).has.been.calledOnceWith({
        certificationIssueReportId: 100,
        resolution: 'resolved',
      });
    });
  });
});
