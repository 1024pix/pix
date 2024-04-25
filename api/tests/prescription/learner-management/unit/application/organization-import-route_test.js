import jsonapiSerializer from 'jsonapi-serializer';

import { organizationImportController } from '../../../../../src/prescription/learner-management/application/organization-import-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/learner-management/application/organization-import-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Router | organization-import-router', function () {
  let checkOrganizationHasLearnerImportFeature, respondWithError;

  beforeEach(function () {
    sinon.stub(securityPreHandlers, 'checkUserIsAdminInSUPOrganizationManagingStudents');
    sinon.stub(securityPreHandlers, 'checkUserIsAdminInSCOOrganizationManagingStudents');
    sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization');
    checkOrganizationHasLearnerImportFeature = sinon.stub();
    sinon
      .stub(securityPreHandlers, 'makeCheckOrganizationHasFeature')
      .withArgs(ORGANIZATION_FEATURE.LEARNER_IMPORT.key)
      .returns(checkOrganizationHasLearnerImportFeature);

    respondWithError = (_, h) =>
      h
        .response(
          new jsonapiSerializer.Error({
            code: 403,
            title: 'Forbidden access',
            detail: 'Missing or insufficient permissions.',
          }),
        )
        .code(403)
        .takeover();
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

          securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents.resolves(true);
          securityPreHandlers.checkUserIsAdminInSCOOrganizationManagingStudents.callsFake(respondWithError);
          securityPreHandlers.checkUserIsAdminInOrganization.resolves(true);
          checkOrganizationHasLearnerImportFeature.callsFake(respondWithError);

          sinon
            .stub(organizationImportController, 'getOrganizationImportStatus')
            .callsFake((_, h) => h.response('ok').code(200));

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

          securityPreHandlers.checkUserIsAdminInSCOOrganizationManagingStudents.resolves(true);
          securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents.callsFake(respondWithError);
          securityPreHandlers.checkUserIsAdminInOrganization.resolves(true);
          checkOrganizationHasLearnerImportFeature.callsFake(respondWithError);

          sinon
            .stub(organizationImportController, 'getOrganizationImportStatus')
            .callsFake((_, h) => h.response('ok').code(200));

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
    context('when the organization has learner import feature', function () {
      context('when user is admin of the organization', function () {
        it('responds 200', async function () {
          // given
          const method = 'GET';
          const url = '/api/organizations/1/import-information';
          const payload = {};

          checkOrganizationHasLearnerImportFeature.resolves(true);
          securityPreHandlers.checkUserIsAdminInOrganization.resolves(true);
          securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents.callsFake(respondWithError);
          securityPreHandlers.checkUserIsAdminInSCOOrganizationManagingStudents.callsFake(respondWithError);

          sinon
            .stub(organizationImportController, 'getOrganizationImportStatus')
            .callsFake((_, h) => h.response('ok').code(200));
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request(method, url, payload);

          // then
          expect(organizationImportController.getOrganizationImportStatus).to.have.been.calledOnce;
          expect(response.statusCode).to.equal(200);
        });
      });
      context('when user is not admin of the organization', function () {
        it('responds 403', async function () {
          // given
          const method = 'GET';
          const url = '/api/organizations/1/import-information';
          const payload = {};

          checkOrganizationHasLearnerImportFeature.resolves(true);
          securityPreHandlers.checkUserIsAdminInOrganization.callsFake(respondWithError);
          securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents.callsFake(respondWithError);
          securityPreHandlers.checkUserIsAdminInSCOOrganizationManagingStudents.callsFake(respondWithError);

          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request(method, url, payload);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });
  context(
    'when the user is not admin for the SUP organization nor SCO organizations nor has learner import feature',
    function () {
      it('responds 403', async function () {
        checkOrganizationHasLearnerImportFeature.callsFake(respondWithError);
        securityPreHandlers.checkUserIsAdminInOrganization.callsFake(respondWithError);
        securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents.callsFake(respondWithError);
        securityPreHandlers.checkUserIsAdminInSCOOrganizationManagingStudents.callsFake(respondWithError);

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'GET';
        const url = '/api/organizations/1/import-information';

        const response = await httpTestServer.request(method, url);

        expect(response.statusCode).to.equal(403);
      });
    },
  );
});
