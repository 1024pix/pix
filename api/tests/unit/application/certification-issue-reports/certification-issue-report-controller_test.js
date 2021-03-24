const { sinon, expect, hFake } = require('../../../test-helper');
const certificationIssueReportController = require('../../../../lib/application/certification-issue-reports/certification-issue-report-controller');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Controller | certification-issue-report-controller', function() {

  describe('#deleteCertificationIssueReport', function() {

    it('should proceed to deletion', async function() {
      // given
      const certificationIssueReportId = 456;
      const userId = 789;
      const request = {
        params: {
          id: certificationIssueReportId,
        },
        auth: {
          credentials: { userId },
        },
      };
      sinon.stub(usecases, 'deleteCertificationIssueReport')
        .withArgs({ certificationIssueReportId, userId })
        .resolves();

      // when
      const response = await certificationIssueReportController.deleteCertificationIssueReport(request, hFake);

      // then
      expect(response).to.be.null;
    });
  });
});
