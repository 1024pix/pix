import { organizationLearnersController } from '../../../../../src/prescription/learner-management/application/organization-learners-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/learner-management/application/organization-learners-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, generateValidRequestAuthorizationHeader, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Prescription | learner management | Application | Router | organization-learner-router', function () {
  describe('DELETE /api/admin/organization-learners/{id}/association', function () {
    it('should return a HTTP status code 204 when user role is "SUPER_ADMIN"', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(organizationLearnersController, 'dissociate').callsFake((request, h) => h.response('ok').code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('DELETE', '/api/admin/organization-learners/1/association');

      // then
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
      sinon.assert.calledOnce(organizationLearnersController.dissociate);
      expect(response.statusCode).to.equal(204);
    });

    it('should return a HTTP status code 204 when user role is "SUPPORT"', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(true));
      sinon.stub(organizationLearnersController, 'dissociate').callsFake((request, h) => h.response('ok').code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('DELETE', '/api/admin/organization-learners/1/association');

      // then
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
      sinon.assert.calledOnce(organizationLearnersController.dissociate);
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
      sinon.stub(organizationLearnersController, 'dissociate').callsFake((request, h) => h.response('ok').code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('DELETE', '/api/admin/organization-learners/1/association');

      // then
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
      sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
      sinon.assert.notCalled(organizationLearnersController.dissociate);
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

  describe('POST /api/organization-learners/reconcile', function () {
    let url, method, httpTestServer, headers, reconcileCommonOrganizationLearnerStub;

    beforeEach(async function () {
      method = 'POST';
      url = '/api/organization-learners/reconcile';
      headers = { authorization: generateValidRequestAuthorizationHeader(666) };

      reconcileCommonOrganizationLearnerStub = sinon
        .stub(organizationLearnersController, 'reconcileCommonOrganizationLearner')
        .resolves('ok');

      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
    });

    describe('error cases', function () {
      it('should throw an error when payload reconciliationInfos is not an object', async function () {
        // given
        const payload = { data: { attributes: { 'campaign-code': 'myCode', 'reconciliation-infos': null } } };

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        expect(response.statusCode).to.equal(400);
        expect(reconcileCommonOrganizationLearnerStub.called).to.be.false;
      });

      it('should not called controller when payload campaignCode is not a string', async function () {
        // given
        const payload = { data: { attributes: { 'campaign-code': null, 'reconciliation-infos': {} } } };

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        expect(response.statusCode).to.equal(400);
        expect(reconcileCommonOrganizationLearnerStub.called).to.be.false;
      });
    });

    it('should called the controller when everything is ok', async function () {
      // given
      const payload = {
        data: { attributes: { 'campaign-code': 'myCode', 'reconciliation-infos': {} }, type: 'organization-learner' },
      };

      // when
      await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(reconcileCommonOrganizationLearnerStub.called).to.be.true;
    });
  });
});
