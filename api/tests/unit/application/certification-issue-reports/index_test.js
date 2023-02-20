import { expect, HttpTestServer, sinon } from '../../../test-helper';
import certificationIssueReportController from '../../../../lib/application/certification-issue-reports/certification-issue-report-controller';
import securityPreHandlers from '../../../../lib/application/security-pre-handlers';
import moduleUnderTest from '../../../../lib/application/certification-issue-reports';

describe('Unit | Application | Certifications Issue Report | Route', function () {
  describe('DELETE /api/certification-issue-reports/{id}', function () {
    it('should return a 200', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId')
        .callsFake((request, h) => h.response(true));
      sinon.stub(certificationIssueReportController, 'deleteCertificationIssueReport').returns('ok');

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('DELETE', '/api/certification-issue-reports/1');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('PATCH /api/certification-issue-reports/{id}', function () {
    context('when no resolution is given', function () {
      it('should return 204', async function () {
        // given
        sinon.stub(certificationIssueReportController, 'manuallyResolve').callsFake((_, h) => h.response().code(204));
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('PATCH', '/api/certification-issue-reports/1', {
          data: {
            resolution: null,
          },
        });

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    it('return forbidden access if user has METIER role', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkAdminMemberHasRoleCertif,
          securityPreHandlers.checkAdminMemberHasRoleSupport,
        ])
        .callsFake(
          () => (request, h) =>
            h
              .response({ errors: new Error('forbidden') })
              .code(403)
              .takeover()
        );

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PATCH', '/api/certification-issue-reports/1', {
        data: {
          resolution: null,
        },
      });

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});
