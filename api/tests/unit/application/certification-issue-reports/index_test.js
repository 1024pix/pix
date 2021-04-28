const { expect, HttpTestServer, sinon } = require('../../../test-helper');
const certificationIssueReportController = require('../../../../lib/application/certification-issue-reports/certification-issue-report-controller');

const moduleUnderTest = require('../../../../lib/application/certification-issue-reports');

describe('Unit | Application | Certifications Issue Report | Route', () => {

  it('DELETE /api/certification-issue-reports/{id} should exist', async () => {
    // given
    sinon.stub(certificationIssueReportController, 'deleteCertificationIssueReport').returns('ok');

    const httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);

    // when
    const response = await httpTestServer.request('DELETE', '/api/certification-issue-reports/1');

    // then
    expect(response.statusCode).to.equal(200);
  });
});
