import sinon from 'sinon';

import { organizationLearnersController } from '../../../../../src/prescription/learner-management/application/organization-learners-controller.js';
import { organizationLearnersRoute as moduleUnderTest } from '../../../../../src/prescription/learner-management/application/organization-learners-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Unit | Prescription | learner management | Application | Router | organization-learner-router', function () {
  describe('GET /api/organizations/{organizationId}/organization-learners/filters', function () {
    it('should call checkUserBelongsToOrganization and the controller', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').callsFake((request, h) => h.response(true));
      sinon
        .stub(organizationLearnersController, 'getOrganizationLearnerFilters')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('GET', '/api/organizations/1/organization-learners/filters');

      // then
      sinon.assert.calledOnce(securityPreHandlers.checkUserBelongsToOrganization);
      sinon.assert.calledOnce(organizationLearnersController.getOrganizationLearnerFilters);
    });

    it('should return 400 when organizationId is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/organizations/ABC/organization-learners/filters');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('DELETE /api/admin/organizations/{organizationId}/organization-learners/{organizationLearnerId}', function () {
    it('should call right handler before calling controller', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkOrganizationLearnerBelongsToOrganization')
        .callsFake((request, h) => h.response().code(200));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response().code(200));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response().code(200));
      sinon
        .stub(organizationLearnersController, 'deleteOrganizationLearnerFromAdmin')
        .callsFake((request, h) => h.response('ok').code(200));
      sinon
        .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSupport,
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
        ])
        .returns(() => true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('DELETE', '/api/admin/organizations/1/organization-learners/2');

      // then
      sinon.assert.calledOnce(securityPreHandlers.checkOrganizationLearnerBelongsToOrganization);
      sinon.assert.calledOnce(securityPreHandlers.hasAtLeastOneAccessOf);
      sinon.assert.calledOnce(organizationLearnersController.deleteOrganizationLearnerFromAdmin);
    });
  });

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
      headers = generateAuthenticatedUserRequestHeaders({ userId: 666 });

      reconcileCommonOrganizationLearnerStub = sinon
        .stub(organizationLearnersController, 'reconcileCommonOrganizationLearner')
        .resolves('ok');

      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
    });

    describe('error cases', function () {
      it('should throw an error when payload reconciliationInfos is not an object', async function () {
        // given
        const payload = { data: { attributes: { organizationId: 123, 'reconciliation-infos': null } } };

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        expect(response.statusCode).to.equal(400);
        expect(reconcileCommonOrganizationLearnerStub.called).to.be.false;
      });

      it('should not called controller when payload organization is not a string', async function () {
        // given
        const payload = { data: { attributes: { organizationId: null, 'reconciliation-infos': {} } } };

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
        data: { attributes: { 'organization-id': 123, 'reconciliation-infos': {} }, type: 'organization-learner' },
      };

      // when
      await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(reconcileCommonOrganizationLearnerStub.called).to.be.true;
    });
  });
});
