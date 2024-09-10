import { organizationPlaceController } from '../../../../../src/prescription/organization-place/application/organization-place-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/organization-place/application/organization-place-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import { expect, generateValidRequestAuthorizationHeader, HttpTestServer, sinon } from '../../../../test-helper.js';

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
      httpTestServer.setupAuthentication();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url, null, null, {
        authorization: generateValidRequestAuthorizationHeader(),
      });

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
        httpTestServer.setupAuthentication();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(method, url, null, null, {
          authorization: generateValidRequestAuthorizationHeader(),
        });

        // then
        expect(organizationPlaceController.findOrganizationPlacesLot).to.not.have.been.called;
        expect(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin).to.have.been.called;
        expect(securityPreHandlers.checkAdminMemberHasRoleMetier).to.have.been.called;
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/organizations/{id}/places-lots', function () {
    let method, url, payload, checkOrganizationHasPlacesFeature, httpTestServer;

    beforeEach(async function () {
      method = 'GET';
      url = '/api/organizations/1/places-lots';
      payload = {};
      httpTestServer = new HttpTestServer();
      httpTestServer.setupAuthentication();
      await httpTestServer.register(moduleUnderTest);

      sinon.stub(organizationPlaceController, 'getOrganizationPlacesLots');
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization');
      checkOrganizationHasPlacesFeature = sinon.stub();
      sinon
        .stub(securityPreHandlers, 'makeCheckOrganizationHasFeature')
        .withArgs(ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key)
        .returns(checkOrganizationHasPlacesFeature);
    });

    it('should call the controller to get organization places', async function () {
      // given
      payload = { params: { id: 3345 } };
      checkOrganizationHasPlacesFeature.resolves(true);
      securityPreHandlers.checkUserIsAdminInOrganization.resolves(true);

      organizationPlaceController.getOrganizationPlacesLots.callsFake((_, h) => h.response('ok').code(200));

      httpTestServer = new HttpTestServer();
      httpTestServer.setupAuthentication();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url, payload, null, {
        authorization: generateValidRequestAuthorizationHeader(),
      });

      // then
      expect(organizationPlaceController.getOrganizationPlacesLots).to.have.been.calledOnce;
      expect(response.statusCode).to.equal(200);
    });

    it('should not call the controller if user do not belong of the organization', async function () {
      // given
      securityPreHandlers.checkUserIsAdminInOrganization.callsFake((request, h) =>
        h.response({ errors: new Error('forbidden') }),
      );
      checkOrganizationHasPlacesFeature.resolves(true);

      // when
      const response = await httpTestServer.request(method, url, payload, null, {
        authorization: generateValidRequestAuthorizationHeader(),
      });

      // then
      expect(organizationPlaceController.getOrganizationPlacesLots).to.not.have.been.called;
      expect(response.statusCode).to.equal(403);
    });

    it('should not call the controller if organization doesnt have the right feature activated', async function () {
      // given
      securityPreHandlers.checkUserIsAdminInOrganization.resolves(true);
      checkOrganizationHasPlacesFeature.callsFake((request, h) => h.response({ errors: new Error('forbidden') }));

      // when
      const response = await httpTestServer.request(method, url, payload, null, {
        authorization: generateValidRequestAuthorizationHeader(),
      });

      // then
      expect(organizationPlaceController.getOrganizationPlacesLots).to.not.have.been.called;
      expect(response.statusCode).to.equal(403);
    });

    it('should not call the controller if the organizationId provided is not a number', async function () {
      // given
      payload = { params: { id: 'chaussette' } };
      securityPreHandlers.checkUserIsAdminInOrganization.resolves(true);
      checkOrganizationHasPlacesFeature.resolves(true);

      // when
      const response = await httpTestServer.request(method, url, payload, null, {
        authorization: generateValidRequestAuthorizationHeader(),
      });

      // then
      expect(organizationPlaceController.getOrganizationPlacesLots).to.not.have.been.called;
      expect(response.statusCode).to.equal(403);
    });
  });
});
