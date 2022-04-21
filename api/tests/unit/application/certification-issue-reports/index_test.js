const { expect, HttpTestServer, sinon } = require('../../../test-helper');
const certificationIssueReportController = require('../../../../lib/application/certification-issue-reports/certification-issue-report-controller');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const moduleUnderTest = require('../../../../lib/application/certification-issue-reports');

describe('Unit | Application | Certifications Issue Report | Route', function () {
  it('DELETE /api/certification-issue-reports/{id} should exist', async function () {
    // given
    sinon.stub(certificationIssueReportController, 'deleteCertificationIssueReport').returns('ok');

    const httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);

    // when
    const response = await httpTestServer.request('DELETE', '/api/certification-issue-reports/1');

    // then
    expect(response.statusCode).to.equal(200);
  });

  describe('PATCH /api/certification-issue-reports/{id}', function () {
    context('when user is ', function () {
      context('when no resolution is given', function () {
        it('should return 204', async function () {
          // given
          sinon.stub(certificationIssueReportController, 'manuallyResolve').callsFake((_, h) => h.response().code(204));
          sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin');
          securityPreHandlers.checkUserHasRoleSuperAdmin.callsFake((_, h) => h.response(true));

          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);
          const payload = {
            data: {
              resolution: null,
            },
          };
          // when
          const response = await httpTestServer.request('PATCH', '/api/certification-issue-reports/1', payload);

          // then
          expect(response.statusCode).to.equal(204);
        });
      });
    });

    context('when user is not Super Admin', function () {
      it('should throw 403', async function () {
        // given
        sinon.stub(certificationIssueReportController, 'manuallyResolve').callsFake((_, h) => h.response().code(204));
        sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin');
        securityPreHandlers.checkUserHasRoleSuperAdmin.callsFake((request, h) => h.response().code(403).takeover());

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        const payload = {
          data: {},
        };
        // when
        const response = await httpTestServer.request('PATCH', '/api/certification-issue-reports/1', payload);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
