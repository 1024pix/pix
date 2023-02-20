import { expect, HttpTestServer, sinon } from '../../../test-helper';
import securityPreHandlers from '../../../../lib/application/security-pre-handlers';
import organizationLearnerController from '../../../../lib/application/organization-learners/organization-learner-controller';
import moduleUnderTest from '../../../../lib/application/organization-learners';

describe('Unit | Application | Router | organization-learner-router', function () {
  context('Routes /admin', function () {
    describe('DELETE /api/admin/organization-learners/{id}/association', function () {
      it('should return a HTTP status code 204 when user role is "SUPER_ADMIN"', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response(true));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(organizationLearnerController, 'dissociate').callsFake((request, h) => h.response('ok').code(204));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('DELETE', '/api/admin/organization-learners/1/association');

        // then
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
        sinon.assert.calledOnce(organizationLearnerController.dissociate);
        expect(response.statusCode).to.equal(204);
      });

      it('should return a HTTP status code 204 when user role is "SUPPORT"', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(true));
        sinon.stub(organizationLearnerController, 'dissociate').callsFake((request, h) => h.response('ok').code(204));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('DELETE', '/api/admin/organization-learners/1/association');

        // then
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
        sinon.assert.calledOnce(organizationLearnerController.dissociate);
        expect(response.statusCode).to.equal(204);
      });

      it('should return a HTTP status code 403 when user does not have access (CERTIF | METIER)', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
        sinon.stub(organizationLearnerController, 'dissociate').callsFake((request, h) => h.response('ok').code(204));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('DELETE', '/api/admin/organization-learners/1/association');

        // then
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
        sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
        sinon.assert.notCalled(organizationLearnerController.dissociate);
        expect(response.statusCode).to.equal(403);
      });

      it('should return a HTTP status code 400 if id parameter is not a number', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('DELETE', '/api/admin/organization-learners/ABC/association');

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('GET /api/organization-learners', function () {
    const method = 'GET';

    it('should return a HTTP status code 200', async function () {
      // given
      sinon
        .stub(organizationLearnerController, 'findAssociation')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/organization-learners?userId=1&campaignCode=ABCDEF123';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/organization-learners/{id}/activity', function () {
    const method = 'GET';

    it('should return a HTTP status code 200', async function () {
      // given
      sinon.stub(organizationLearnerController, 'getActivity').callsFake((request, h) => h.response('ok').code(200));
      sinon
        .stub(securityPreHandlers, 'checkUserBelongsToLearnersOrganization')
        .callsFake((request, h) => h.response(true));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/organization-learners/1/activity';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      sinon.assert.calledOnce(securityPreHandlers.checkUserBelongsToLearnersOrganization);
    });

    it('should return a HTTP status error code 403', async function () {
      // given
      sinon.stub(organizationLearnerController, 'getActivity').callsFake((request, h) => h.response('ok').code(200));
      sinon
        .stub(securityPreHandlers, 'checkUserBelongsToLearnersOrganization')
        .callsFake((request, h) => h.response().code(403).takeover());

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/organization-learners/1/activity';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
  describe('GET /api/organization-learners/{id}', function () {
    const method = 'GET';

    it('should return a HTTP status code 200', async function () {
      // given
      sinon.stub(organizationLearnerController, 'getLearner').callsFake((request, h) => h.response('ok').code(200));
      sinon
        .stub(securityPreHandlers, 'checkUserBelongsToLearnersOrganization')
        .callsFake((request, h) => h.response(true));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/organization-learners/77';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(securityPreHandlers.checkUserBelongsToLearnersOrganization).to.have.been.calledBefore(
        organizationLearnerController.getLearner
      );
    });
  });
});
