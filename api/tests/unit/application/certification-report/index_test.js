const { expect, HttpTestServer, sinon } = require('../../../test-helper');
const certificationReportController = require('../../../../lib/application/certification-reports/certification-report-controller');

const moduleUnderTest = require('../../../../lib/application/certification-reports');

describe('Unit | Application | Certifications Report | Route', () => {

  it('POST /api/certification-reports/{id}/certification-issue-reports should exist', async () => {
    // given
    sinon.stub(certificationReportController, 'saveCertificationIssueReport').returns('ok');
    const httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);

    // when
    const response = await httpTestServer.request('POST', '/api/certification-reports/1/certification-issue-reports');

    // then
    expect(response.statusCode).to.equal(200);
  });
});
