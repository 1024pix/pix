const { expect, HttpTestServer, sinon } = require('../../../test-helper');
const certificationReportModule = require('../../../../lib/application/certification-reports');
const certificationReportController = require('../../../../lib/application/certification-reports/certification-report-controller');

describe('Unit | Application | Certifications Report | Route', function() {

  it('POST /api/certification-reports/{id}/certification-issue-reports should exist', async function() {
    // given
    sinon.stub(certificationReportController, 'saveCertificationIssueReport').returns('ok');
    const httpTestServer = new HttpTestServer(certificationReportModule);

    // when
    const response = await httpTestServer.request('POST', '/api/certification-reports/1/certification-issue-reports');

    // then
    expect(response.statusCode).to.equal(200);
  });
});
