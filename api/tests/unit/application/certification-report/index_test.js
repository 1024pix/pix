const { expect, HttpTestServer, sinon } = require('../../../test-helper');
const certificationReportController = require('../../../../lib/application/certification-reports/certification-report-controller');
const { NotFoundError } = require('../../../../lib/application/http-errors');
const authorization = require('../../../../lib/application/preHandlers/authorization');
const moduleUnderTest = require('../../../../lib/application/certification-reports');

describe('Unit | Application | Certifications Report | Route', function () {
  it('POST /api/certification-reports/{id}/certification-issue-reports should exist', async function () {
    // given
    sinon.stub(certificationReportController, 'saveCertificationIssueReport').returns('ok');
    const httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);

    // when
    const response = await httpTestServer.request('POST', '/api/certification-reports/1/certification-issue-reports');

    // then
    expect(response.statusCode).to.equal(200);
  });

  describe('POST /api/certification-reports/{id}/abort', function () {
    it('Returns HTTP 200 if the logged user has access to the session', async function () {
      // given
      sinon.stub(authorization, 'verifyCertificationSessionAuthorization').returns('ok');
      sinon.stub(certificationReportController, 'abort').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/certification-reports/1/abort');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('Returns HTTP 404 if the logged user is not allowed to access the session', async function () {
      // given
      sinon.stub(authorization, 'verifyCertificationSessionAuthorization').throws(new NotFoundError('coucou'));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/certification-reports/1/abort');

      const parsedPayload = JSON.parse(response.payload);
      const errorMessage = parsedPayload.errors[0].detail;

      // then
      expect(response.statusCode).to.equal(404);
      expect(errorMessage).to.equal('coucou');
    });
  });
});
