import { expect, sinon, HttpTestServer } from '../../../../test-helper.js';
import { autonomousCourseController } from '../../../../../src/evaluation/application/autonomous-courses/autonomous-course-controller.js';
import { securityPreHandlers } from '../../../../../lib/application/security-pre-handlers.js';
import * as autonomousCoursesRouter from '../../../../../src/evaluation/application/autonomous-courses/index.js';

describe('Unit | Application | Badges | Routes', function () {
  describe('GET /api/admin/autonomous-courses', function () {
    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return an HTTP status code 200', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon.stub(autonomousCourseController, 'findPaginatedList').returns({});
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(autonomousCoursesRouter);

        // when
        const { statusCode } = await httpTestServer.request('GET', '/api/admin/autonomous-courses');

        // then
        expect(statusCode).to.equal(200);
      });

      context('when user has role "CERTIF"', function () {
        it('should return a response with an HTTP status code 403', async function () {
          // given
          sinon
            .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
            .withArgs([
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
              securityPreHandlers.checkAdminMemberHasRoleSupport,
              securityPreHandlers.checkAdminMemberHasRoleMetier,
            ])
            .callsFake(
              () => (request, h) =>
                h
                  .response({ errors: new Error('forbidden') })
                  .code(403)
                  .takeover(),
            );
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(autonomousCoursesRouter);

          // when
          const { statusCode } = await httpTestServer.request('GET', '/api/admin/autonomous-courses');

          // then
          expect(statusCode).to.equal(403);
        });
      });
    });
  });
});
