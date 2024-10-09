import { certificationIssueReportController } from '../../../../../src/certification/session-management/application/certification-issue-report-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/session-management/application/certification-issue-report-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Certifications Issue Report | Route', function () {
  describe('DELETE /api/certification-issue-reports/{id}', function () {
    it('should return a 200', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId')
        .callsFake((request, h) => h.response(true));
      sinon.stub(certificationIssueReportController, 'deleteCertification').returns('ok');

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('DELETE', '/api/certification-issue-reports/1');

      // then
      expect(response.statusCode).to.equal(200);
    });

    context(
      'when the prehandler checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId respond a 403',
      function () {
        it('should return a 403', async function () {
          // given
          sinon
            .stub(securityPreHandlers, 'checkUserIsMemberOfCertificationCenterSessionFromCertificationIssueReportId')
            .callsFake((request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover(),
            );

          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request('DELETE', '/api/certification-issue-reports/1');

          // then
          expect(response.statusCode).to.equal(403);
        });
      },
    );
  });

  describe('PATCH /api/certification-issue-reports/{id}', function () {
    context('when no resolution is given', function () {
      it('should return 204', async function () {
        // given
        sinon.stub(certificationIssueReportController, 'manuallyResolve').callsFake((_, h) => h.response().code(204));
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);

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
        .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
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
              .takeover(),
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
