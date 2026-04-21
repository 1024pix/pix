import sinon from 'sinon';

import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { membershipController } from '../../../../../src/team/application/membership/membership.controller.js';
import { teamRoutes } from '../../../../../src/team/application/routes.js';

import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Team | Application | Admin | Route | Membership', function () {
  describe('POST /api/admin/memberships', function () {
    it('returns forbidden access if admin member has CERTIF role', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleCertif').callsFake((request, h) => h.response(true));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(teamRoutes[0]);

      // when
      const response = await httpTestServer.request('POST', `/api/admin/memberships`);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('PATCH /api/admin/memberships/{id}', function () {
    it('should return 200 if user is Pix Admin', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(membershipController, 'update').callsFake((request, h) => h.response().code(200));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(teamRoutes);
      const id = 123;

      // when
      const response = await httpTestServer.request('PATCH', `/api/admin/memberships/${id}`);

      // then
      expect(response.statusCode).to.equal(200);
      expect(membershipController.update).to.have.been.called;
    });

    it('returns forbidden access if admin member has CERTIF role', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleCertif').callsFake((request, h) => h.response(true));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(teamRoutes);

      // when
      const response = await httpTestServer.request('PATCH', `/api/admin/memberships/1`);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('POST /api/admin/memberships/{id}/disable', function () {
    it('returns 204 if user is Pix Admin', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(membershipController, 'disable').callsFake((request, h) => h.response().code(204));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(teamRoutes);
      const membershipId = 123;

      // when
      const response = await httpTestServer.request('POST', `/api/admin/memberships/${membershipId}/disable`);

      // then
      expect(response.statusCode).to.equal(204);
      expect(membershipController.disable).to.have.been.called;
    });

    it('returns forbidden access if admin member has CERTIF role', async function () {
      // given
      sinon.stub(membershipController, 'disable');

      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleCertif').callsFake((request, h) => h.response(true));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(teamRoutes);

      // when
      const response = await httpTestServer.request('POST', '/api/admin/memberships/1/disable');

      // then
      expect(response.statusCode).to.equal(403);
      expect(membershipController.disable).to.have.not.been.called;
    });
  });
});
