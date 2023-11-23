import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import { securityPreHandlers } from '../../../../../lib/application/security-pre-handlers.js';
import * as moduleUnderTest from '../../../../../src/prescription/organization-place/application/organization-place-route.js';
import { organizationPlaceController } from '../../../../../src/prescription/organization-place/application/organization-place-controller.js';

describe('Integration | Application | organization-place-route', function () {
  describe('GET /api/admin/organizations/:id/places', function () {
    it('should call the controller to archive the organization', async function () {
      // given
      const method = 'GET';
      const url = '/api/admin/organizations/1/places';

      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon
        .stub(organizationPlaceController, 'findOrganizationPlacesLot')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(organizationPlaceController.findOrganizationPlacesLot).to.have.been.calledOnce;
    });
  });
  describe('DELETE /api/admin/organizations/{id}/places/{placeId}', function () {
    context('when user is not allowed to access resource', function () {
      it('should resolve a 403 HTTP response', async function () {
        // given
        const method = 'DELETE';
        const url = '/api/admin/organizations/1/places/2';

        sinon.stub(organizationPlaceController, 'findOrganizationPlacesLot');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }));

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(organizationPlaceController.findOrganizationPlacesLot).to.not.have.been.called;
        expect(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin).to.have.been.called;
        expect(securityPreHandlers.checkAdminMemberHasRoleMetier).to.have.been.called;
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
