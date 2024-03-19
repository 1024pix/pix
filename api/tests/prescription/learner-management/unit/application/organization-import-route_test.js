import { organizationImportController } from '../../../../../src/prescription/learner-management/application/organization-import-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/learner-management/application/organization-import-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Router | organization-import-router', function () {
  beforeEach(function () {
    sinon.stub(securityPreHandlers, 'checkUserIsAdminInSUPOrganizationManagingStudents');
    sinon.stub(securityPreHandlers, 'checkUserIsAdminInSCOOrganizationManagingStudents');
  });

  describe('GET /api/organizations/{organizationId}/import-information', function () {
    it('should throw an error when id is invalid', async function () {
      // given
      const method = 'GET';
      const url = '/api/organizations/wrongId/import-information';
      const payload = {};

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });
    context(
      'when the user is an admin for the organization and the organization is SUP and manages students',
      function () {
        it('responds 200', async function () {
          // given
          const method = 'GET';
          const url = '/api/organizations/1/import-information';
          const payload = {};

          securityPreHandlers.checkUserIsAdminInSCOOrganizationManagingStudents.callsFake((request, h) =>
            h.response().code(403).takeover(),
          );
          securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents.resolves(true);

          sinon
            .stub(organizationImportController, 'getOrganizationImportStatus')
            .callsFake((request, h) => h.response('ok').code(200));
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request(method, url, payload);

          // then
          expect(organizationImportController.getOrganizationImportStatus).to.have.been.calledOnce;
          expect(response.statusCode).to.equal(200);
        });
      },
    );
    context(
      'when the user is an admin for the organization and the organization is SCO and manages students',
      function () {
        it('responds 200', async function () {
          // given
          const method = 'GET';
          const url = '/api/organizations/1/import-information';
          const payload = {};

          securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents.callsFake((request, h) =>
            h.response().code(403).takeover(),
          );
          securityPreHandlers.checkUserIsAdminInSCOOrganizationManagingStudents.resolves(true);

          sinon
            .stub(organizationImportController, 'getOrganizationImportStatus')
            .callsFake((request, h) => h.response('ok').code(200));
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request(method, url, payload);

          // then
          expect(organizationImportController.getOrganizationImportStatus).to.have.been.calledOnce;
          expect(response.statusCode).to.equal(200);
        });
      },
    );
  });
  context('when the user is not admin for the SUP organization nor SCO organizations', function () {
    it('responds 403', async function () {
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
      securityPreHandlers.hasAtLeastOneAccessOf.returns((request, h) => h.response().code(403).takeover());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const url = '/api/organizations/1/import-information';

      const response = await httpTestServer.request(method, url);

      expect(response.statusCode).to.equal(403);
    });
  });
});
