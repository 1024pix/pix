import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import { securityPreHandlers } from '../../../../../lib/application/security-pre-handlers.js';
import { scoOrganizationManagementController } from '../../../../../src/prescription/learner-management/application/sco-organization-management-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/learner-management/application/sco-organization-management-route.js';

describe('Unit | Router | organization-router', function () {
  describe('POST /api/organizations/{id}/sco-organization-learners/import-siecle', function () {
    it('should call the organization controller to import organizationLearners', async function () {
      // given
      const method = 'POST';
      const url = '/api/organizations/1/sco-organization-learners/import-siecle';
      const payload = {};

      sinon
        .stub(securityPreHandlers, 'checkUserIsAdminInSCOOrganizationManagingStudents')
        .callsFake((request, h) => h.response(true));
      sinon
        .stub(scoOrganizationManagementController, 'importOrganizationLearnersFromSIECLE')
        .callsFake((request, h) => h.response('ok').code(201));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(scoOrganizationManagementController.importOrganizationLearnersFromSIECLE).to.have.been.calledOnce;
      expect(response.statusCode).to.equal(201);
    });

    it('should throw an error when id is invalid', async function () {
      // given
      const method = 'POST';
      const url = '/api/organizations/wrongId/sco-organization-learners/import-siecle';
      const payload = {};

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
