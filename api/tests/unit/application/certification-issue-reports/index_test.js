const { expect, HttpTestServer, sinon } = require('../../../test-helper');
const certificationIssueReportModule = require('../../../../lib/application/certification-issue-reports');
const certificationIssueReportController = require('../../../../lib/application/certification-issue-reports/certification-issue-report-controller');

describe('Unit | Application | Certifications Issue Report | Route', function() {

  it('DELETE /api/certification-issue-reports/{id} should exist', async function() {
    // given
    sinon.stub(certificationIssueReportController, 'deleteCertificationIssueReport').returns('ok');
    const httpTestServer = new HttpTestServer(certificationIssueReportModule);

    // when
    const response = await httpTestServer.request('DELETE', '/api/certification-issue-reports/1');

    // then
    expect(response.statusCode).to.equal(200);
  });
});
