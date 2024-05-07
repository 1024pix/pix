import { organizationController } from '../../../../src/organizational-entities/application/organization-controller.js';
import { organizationalEntitiesRoutes } from '../../../../src/organizational-entities/application/routes.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Unit | Router | organization-router', function () {
  describe('POST /api/admin/organizations/add-organization-features', function () {
    it('should return 204 when user can add organization features', async function () {
      // given
      const method = 'POST';
      const url = '/api/admin/organizations/add-organization-features';
      const payload = {};

      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));

      sinon
        .stub(organizationController, 'addOrganizationFeatureInBatch')
        .callsFake((request, h) => h.response('ok').code(204));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(organizationalEntitiesRoutes[0]);

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
