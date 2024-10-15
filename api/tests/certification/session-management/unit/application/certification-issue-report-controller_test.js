import { certificationIssueReportController } from '../../../../../src/certification/session-management/application/certification-issue-report-controller.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | certification-issue-report-controller', function () {
  describe('#deleteCertificationIssueReport', function () {
    it('should call deleteCertificationIssuerReport usecase', async function () {
      // given
      const certificationIssueReportId = 456;
      const userId = 789;
      const dependencies = { deleteCertificationIssueReport: sinon.stub() };

      // when
      const response = await certificationIssueReportController.deleteCertification(
        {
          params: {
            id: certificationIssueReportId,
          },
          auth: {
            credentials: { userId },
          },
        },
        hFake,
        dependencies,
      );

      // then
      expect(response.statusCode).to.deep.equal(204);
      expect(dependencies.deleteCertificationIssueReport).to.have.been.calledWithExactly({
        certificationIssueReportId,
      });
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
      const dependencies = { manuallyResolveCertificationIssueReport: sinon.stub() };

      // when
      const response = await certificationIssueReportController.manuallyResolve(request, hFake, dependencies);

      // then
      expect(response.statusCode).to.deep.equal(204);
      expect(dependencies.manuallyResolveCertificationIssueReport).has.been.calledOnceWith({
        certificationIssueReportId: 100,
        resolution: 'resolved',
      });
    });
  });
});
