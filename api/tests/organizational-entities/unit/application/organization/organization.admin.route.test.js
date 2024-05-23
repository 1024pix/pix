import { organizationAdminController } from '../../../../../src/organizational-entities/application/organization/organization.admin.controller.js';
import { organizationalEntitiesRoutes } from '../../../../../src/organizational-entities/application/routes.js';
import {
  AlreadyExistingOrganizationFeatureError,
  FeatureNotFound,
  FeatureParamsNotProcessable,
  OrganizationNotFound,
} from '../../../../../src/organizational-entities/domain/errors.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Router | organization-router', function () {
  describe('POST /api/admin/organizations/add-organization-features', function () {
    const method = 'POST';
    const url = '/api/admin/organizations/add-organization-features';
    const payload = {};

    let httpTestServer;

    beforeEach(async function () {
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').resolves(true);

      sinon.stub(organizationAdminController, 'addOrganizationFeatureInBatch');
      httpTestServer = new HttpTestServer();
      await httpTestServer.register(organizationalEntitiesRoutes[0]);
    });

    it('should return call the `checkAdminMemberHasRoleSuperAdmin` security prehandler', async function () {
      // given
      organizationAdminController.addOrganizationFeatureInBatch.resolves(true);

      // when
      await httpTestServer.request(method, url, payload);

      // then
      expect(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin).to.have.been.calledOnce;
    });

    it('should return call the `addOrganizationFeatureInBatch` controller', async function () {
      // given
      organizationAdminController.addOrganizationFeatureInBatch.resolves(true);

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(organizationalEntitiesRoutes[0]);

      // when
      await httpTestServer.request(method, url, payload);

      // then
      expect(organizationAdminController.addOrganizationFeatureInBatch).to.have.been.calledOnce;
    });

    it('return a 422 status code when trying to add feature on non existing organization', async function () {
      organizationAdminController.addOrganizationFeatureInBatch.rejects(new OrganizationNotFound());

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(422);
    });

    it('return a 422 status code when trying to add non existing feature', async function () {
      organizationAdminController.addOrganizationFeatureInBatch.rejects(new FeatureNotFound());

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(422);
    });

    it('return a 422 status code when trying to add non processable params', async function () {
      organizationAdminController.addOrganizationFeatureInBatch.rejects(new FeatureParamsNotProcessable());

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(422);
    });

    it('return a 409 status code when trying to add already existing feature on organization', async function () {
      organizationAdminController.addOrganizationFeatureInBatch.rejects(new AlreadyExistingOrganizationFeatureError());

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(409);
    });
  });
});
