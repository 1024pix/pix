import {  organizationLearnerFeaturesController} from '../../../../../src/prescription/organization-learner-feature/application/organization-learner-features-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/organization-learner-feature/application/organization-learner-features-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, generateValidRequestAuthorizationHeader, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Prescription | Organization-learner-feature | Application | organization-learner-features-router', function () {
  // describe('DELETE /api/admin/organization-learners/{id}/association', function () {
  //   it('should return a HTTP status code 204 when user role is "SUPER_ADMIN"', async function () {
  //     // given
  //     sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
  //     sinon
  //       .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
  //       .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
  //     sinon.stub(organizationLearnersController, 'dissociate').callsFake((request, h) => h.response('ok').code(204));
  //     const httpTestServer = new HttpTestServer();
  //     await httpTestServer.register(moduleUnderTest);
  //
  //     // when
  //     const response = await httpTestServer.request('DELETE', '/api/admin/organization-learners/1/association');
  //
  //     // then
  //     sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
  //     sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
  //     sinon.assert.calledOnce(organizationLearnersController.dissociate);
  //     expect(response.statusCode).to.equal(204);
  //   });
  //
  //   it('should return a HTTP status code 204 when user role is "SUPPORT"', async function () {
  //     // given
  //     sinon
  //       .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
  //       .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
  //     sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(true));
  //     sinon.stub(organizationLearnersController, 'dissociate').callsFake((request, h) => h.response('ok').code(204));
  //     const httpTestServer = new HttpTestServer();
  //     await httpTestServer.register(moduleUnderTest);
  //
  //     // when
  //     const response = await httpTestServer.request('DELETE', '/api/admin/organization-learners/1/association');
  //
  //     // then
  //     sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
  //     sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
  //     sinon.assert.calledOnce(organizationLearnersController.dissociate);
  //     expect(response.statusCode).to.equal(204);
  //   });
  //
  //   it('should return a HTTP status code 403 when user does not have access (CERTIF | METIER)', async function () {
  //     // given
  //     sinon
  //       .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
  //       .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
  //     sinon
  //       .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
  //       .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
  //     sinon.stub(organizationLearnersController, 'dissociate').callsFake((request, h) => h.response('ok').code(204));
  //     const httpTestServer = new HttpTestServer();
  //     await httpTestServer.register(moduleUnderTest);
  //
  //     // when
  //     const response = await httpTestServer.request('DELETE', '/api/admin/organization-learners/1/association');
  //
  //     // then
  //     sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin);
  //     sinon.assert.calledOnce(securityPreHandlers.checkAdminMemberHasRoleSupport);
  //     sinon.assert.notCalled(organizationLearnersController.dissociate);
  //     expect(response.statusCode).to.equal(403);
  //   });
  //
  //   it('should return a HTTP status code 400 if id parameter is not a number', async function () {
  //     // given
  //     const httpTestServer = new HttpTestServer();
  //     await httpTestServer.register(moduleUnderTest);
  //
  //     // when
  //     const response = await httpTestServer.request('DELETE', '/api/admin/organization-learners/ABC/association');
  //
  //     // then
  //     expect(response.statusCode).to.equal(400);
  //   });
  // });

  describe('POST /api/organization/{organizationId}/organization-learners/{organizationLearnerId}/features/{featureKey}', function () {
    let url, method, httpTestServer, headers, createOrganizationLearnerFeaturesStub;

    beforeEach(async function () {
      method = 'POST';
      url = '/api/organization/10/organization-learners/1561/features/ORALIZATION';
      headers = { authorization: generateValidRequestAuthorizationHeader(1561) };

      createOrganizationLearnerFeaturesStub = sinon.stub(
        organizationLearnerFeaturesController,
        'createOrganizationLearnerFeatures',
      );

      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
    });

    describe('error cases', function () {
      it("should throw an error when organization don't exists", async function () {
        // given
        createOrganizationLearnerFeaturesStub.callsFake((request, h) => h.response('ko').code(404));
        const payload = {};

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        expect(response.statusCode).to.equal(404);
        expect(createOrganizationLearnerFeaturesStub.called).to.be.false;
      });
    });

    describe('ok cases', function () {
      it("should throw an error when organization don't exists", async function () {
        // given
        createOrganizationLearnerFeaturesStub.callsFake((request, h) => h.response('ok').code(200));
        const payload = {};

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        expect(response.statusCode).to.equal(200);
        expect(createOrganizationLearnerFeaturesStub.called).to.be.false;
      });
    });
  });
});
