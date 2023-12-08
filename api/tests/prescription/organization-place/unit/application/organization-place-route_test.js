import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';
import * as moduleUnderTest from '../../../../../src/prescription/organization-place/application/organization-place-route.js';
import { expect, sinon } from '../../../../test-helper.js';
import { securityPreHandlers } from '../../../../../lib/application/security-pre-handlers.js';
import { usecases } from '../../../../../src/prescription/organization-place/domain/usecases/index.js';
import { organizationPlaceController } from '../../../../../src/prescription/organization-place/application/organization-place-controller.js';
import * as organizationPlacesCategories from '../../../../../src/prescription/organization-place/domain/constants/organization-places-categories.js';

describe('Unit | Router | organization-place-route', function () {
  describe('GET /api/admin/organizations/{id}/places', function () {
    it('should return BadRequest (400) if id is not numeric', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const idNotNumeric = 'foo';
      const method = 'GET';
      const url = `/api/admin/organizations/${idNotNumeric}/places`;

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return an empty list when no places is found', async function () {
      // given
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(usecases, 'findOrganizationPlacesLot').returns([]);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const url = '/api/admin/organizations/1/places';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal([]);
    });
  });

  describe('POST /api/admin/organizations/{id}/places', function () {
    const method = 'POST';
    const url = '/api/admin/organizations/1/places';

    it('should return HTTP code 201', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));

      sinon
        .stub(organizationPlaceController, 'createOrganizationPlacesLot')
        .callsFake((request, h) => h.response().created());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          attributes: {
            'organization-id': 2,
            count: 10,
            category: organizationPlacesCategories.FREE_RATE,
            'activation-date': '2022-01-02',
            'expiration-date': '2023-01-01',
            reference: 'ABC123',
            'created-by': 122,
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);
      // then
      expect(response.statusCode).to.equal(201);
    });

    it('returns forbidden access if admin member has a non super admin role', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          attributes: {
            'organization-id': 2,
            count: 10,
            category: organizationPlacesCategories.FREE_RATE,
            'activation-date': '2022-01-02',
            'expiration-date': '2023-01-01',
            reference: 'ABC123',
            'created-by': 122,
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('should reject request with HTTP code 403, when payload is incomplete', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          attributes: {
            'organization-id': 2,
            count: 10,
            category: organizationPlacesCategories.FREE_RATE,
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});
