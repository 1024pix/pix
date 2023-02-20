import { expect, HttpTestServer, sinon } from '../../../test-helper';
import securityPreHandlers from '../../../../lib/application/security-pre-handlers';
import moduleUnderTest from '../../../../lib/application/memberships';
import membershipController from '../../../../lib/application/memberships/membership-controller';

describe('Unit | Router | membership-router', function () {
  describe('PATCH /api/admin/memberships/{id}', function () {
    it('should return 200 if user is Pix Admin', async function () {
      // given
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(membershipController, 'update').callsFake((request, h) => h.response().code(200));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
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
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PATCH', `/api/admin/memberships/1`);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('PATCH /api/memberships/{id}', function () {
    it('should return 200 if user is admin in organization', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').callsFake((request, h) => h.response(true));
      sinon.stub(membershipController, 'update').callsFake((request, h) => h.response().code(200));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const membershipId = 123;

      // when
      const response = await httpTestServer.request('PATCH', `/api/memberships/${membershipId}`);

      // then
      expect(response.statusCode).to.equal(200);
      expect(membershipController.update).to.have.been.called;
    });

    it('should return 403 if user is not admin in organization', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkUserIsAdminInOrganization')
        .callsFake((request, h) => h.response().code(403).takeover());
      sinon.stub(membershipController, 'update');

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const id = 123;

      // when
      const response = await httpTestServer.request('PATCH', `/api/memberships/${id}`);

      // then
      expect(response.statusCode).to.equal(403);
      expect(membershipController.update).to.have.not.been.called;
    });
  });

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
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', `/api/admin/memberships`);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('POST /api/admin/memberships/{id}/disable', function () {
    it('should return 204 if user is Pix Admin', async function () {
      // given
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(membershipController, 'disable').callsFake((request, h) => h.response().code(204));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
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
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/admin/memberships/1/disable');

      // then
      expect(response.statusCode).to.equal(403);
      expect(membershipController.disable).to.have.not.been.called;
    });
  });

  describe('POST /api/memberships/{id}/disable', function () {
    it('should return 204 if user is admin in organization', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').callsFake((request, h) => h.response(true));
      sinon.stub(membershipController, 'disable').callsFake((request, h) => h.response().code(204));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const membershipId = 123;

      // when
      const response = await httpTestServer.request('POST', `/api/memberships/${membershipId}/disable`);

      // then
      expect(response.statusCode).to.equal(204);
      expect(membershipController.disable).to.have.been.called;
    });

    it('should return 403 if user is not admin in organization', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkUserIsAdminInOrganization')
        .callsFake((request, h) => h.response().code(403).takeover());
      sinon.stub(membershipController, 'disable');

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const membershipId = 123;

      // when
      const response = await httpTestServer.request('POST', `/api/memberships/${membershipId}/disable`);

      // then
      expect(response.statusCode).to.equal(403);
      expect(membershipController.disable).to.have.not.been.called;
    });
  });
});
