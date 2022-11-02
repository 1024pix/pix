const { expect, HttpTestServer, sinon } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const trainingController = require('../../../../lib/application/trainings/training-controller');
const moduleUnderTest = require('../../../../lib/application/trainings');

describe('Unit | Router | training-router', function () {
  describe('PATCH /api/admin/trainings', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        role: 'SUPER_ADMIN',
        securityPreHandlersResponses: {
          checkAdminMemberHasRoleSuperAdmin: (request, h) => h.response(true),
          checkAdminMemberHasRoleMetier: (request, h) => h.response({ errors: new Error('forbidden') }).code(403),
        },
      },
      {
        role: 'METIER',
        securityPreHandlersResponses: {
          checkAdminMemberHasRoleSuperAdmin: (request, h) => h.response({ errors: new Error('forbidden') }).code(403),
          checkAdminMemberHasRoleMetier: (request, h) => h.response(true),
        },
      },
    ].forEach(({ role, securityPreHandlersResponses }) => {
      it(`should verify user identity and return success update when user role is "${role}"`, async function () {
        // given
        sinon.stub(trainingController, 'update').returns('ok');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake(securityPreHandlersResponses.checkAdminMemberHasRoleSuperAdmin);
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
          .callsFake(securityPreHandlersResponses.checkAdminMemberHasRoleMetier);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const payloadAttributes = { title: 'new title' };
        const payload = { data: { attributes: payloadAttributes } };

        // when
        const result = await httpTestServer.request('PATCH', '/api/admin/trainings/12344', payload);

        // then
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleMetier);
        sinon.assert.calledOnce(trainingController.update);
        expect(result.statusCode).to.equal(200);
      });
    });

    it('should return bad request when param id is not numeric', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = { data: { attributes: { title: 'new title' } } };

      // when
      const result = await httpTestServer.request('PATCH', '/api/admin/trainings/not_number', payload);

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('should return bad request when payload is not provided', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('PATCH', '/api/admin/trainings/12344');

      // then
      expect(result.statusCode).to.equal(400);
    });

    it(`should return 403 when user does not have access METIER`, async function () {
      // given
      sinon.stub(trainingController, 'update').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payloadAttributes = { title: 'new title' };
      const payload = { data: { attributes: payloadAttributes } };

      // when
      const result = await httpTestServer.request('PATCH', '/api/admin/trainings/12344', payload);

      // then
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleMetier);
      sinon.assert.notCalled(trainingController.update);
      expect(result.statusCode).to.equal(403);
    });
  });
});
