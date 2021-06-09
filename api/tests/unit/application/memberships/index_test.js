const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');

const moduleUnderTest = require('../../../../lib/application/memberships');

const membershipController = require('../../../../lib/application/memberships/membership-controller');

describe('Unit | Router | membership-router', () => {

  describe('PATCH /api/admin/memberships/{id}', () => {

    it('should return 200 if user is Pix Admin', async () => {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
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

    it('should return 403 if user is not Pix Admin', async () => {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response().code(403).takeover());
      sinon.stub(membershipController, 'update');

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const id = 123;

      // when
      const response = await httpTestServer.request('PATCH', `/api/admin/memberships/${id}`);

      // then
      expect(response.statusCode).to.equal(403);
      expect(membershipController.update).to.have.not.been.called;
    });
  });

  describe('PATCH /api/memberships/{id}', () => {

    it('should return 200 if user is admin in organization', async () => {
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

    it('should return 403 if user is not admin in organization', async () => {
      // given
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').callsFake((request, h) => h.response().code(403).takeover());
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

  describe('POST /api/admin/memberships/{id}/disable', () => {

    it('should return 204 if user is Pix Admin', async () => {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
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

    it('should return 403 if user is not Pix Admin', async () => {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response().code(403).takeover());
      sinon.stub(membershipController, 'disable');

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const membershipId = 123;

      // when
      const response = await httpTestServer.request('POST', `/api/admin/memberships/${membershipId}/disable`);

      // then
      expect(response.statusCode).to.equal(403);
      expect(membershipController.disable).to.have.not.been.called;
    });
  });

  describe('POST /api/memberships/{id}/disable', () => {

    it('should return 204 if user is admin in organization', async () => {
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

    it('should return 403 if user is not admin in organization', async () => {
      // given
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').callsFake((request, h) => h.response().code(403).takeover());
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
