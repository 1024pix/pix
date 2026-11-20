import { expect } from 'chai';
import sinon from 'sinon';

import { creditsLotController } from '../../../../../src/organizational-entities/application/credits/credits-lot.admin.controller.js';
import { creditsLotsAdminRoute as moduleUnderTest } from '../../../../../src/organizational-entities/application/credits/credits-lot.admin.route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Application | Admin | Route | Credits', function () {
  describe('GET /api/admin/{organizationId}/credits-lots', function () {
    describe('when the user authenticated has no role', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .returns((request, h) => h.response().code(403).takeover());
        sinon.stub(creditsLotController, 'findOrganizationCreditsLot').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/organizations/9999/credits-lots', {});

        // then
        expect(response.statusCode).to.equal(403);
        sinon.assert.notCalled(creditsLotController.findOrganizationCreditsLot);
      });
    });

    it('should restrict access with the four admin roles for reading', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(creditsLotController, 'findOrganizationCreditsLot').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('GET', '/api/admin/organizations/9999/credits-lots', {});

      // then
      sinon.assert.calledWithExactly(securityPreHandlers.hasAtLeastOneAccessOf, [
        securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
        securityPreHandlers.checkAdminMemberHasRoleMetier,
        securityPreHandlers.checkAdminMemberHasRoleCertif,
        securityPreHandlers.checkAdminMemberHasRoleSupport,
      ]);
    });
  });
});
