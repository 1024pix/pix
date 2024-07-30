import jsonapiSerializer from 'jsonapi-serializer';

import { organizationPlaceController } from '../../../../../src/prescription/organization-place/application/organization-place-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/organization-place/application/organization-place-route.js';
import * as organizationPlacesCategories from '../../../../../src/prescription/organization-place/domain/constants/organization-places-categories.js';
import { usecases } from '../../../../../src/prescription/organization-place/domain/usecases/index.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import { EntityValidationError } from '../../../../../src/shared/domain/errors.js';
import { expect, generateValidRequestAuthorizationHeader, sinon } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Router | organization-place-route', function () {
  let httpTestServer, checkOrganizationHasPlacesFeature, respondWithError;

  beforeEach(async function () {
    checkOrganizationHasPlacesFeature = sinon.stub();
    sinon
      .stub(securityPreHandlers, 'makeCheckOrganizationHasFeature')
      .withArgs(ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key)
      .returns(checkOrganizationHasPlacesFeature);

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
    sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
    sinon.stub(usecases, 'findOrganizationPlacesLot');
    sinon.stub(organizationPlaceController, 'createOrganizationPlacesLot');
    sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin');
    sinon.stub(organizationPlaceController, 'getOrganizationPlacesStatistics');
    httpTestServer = new HttpTestServer();
    httpTestServer.setupAuthentication();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('GET /api/admin/organizations/{id}/places', function () {
    it('should return BadRequest (400) if id is not numeric', async function () {
      // given
      securityPreHandlers.hasAtLeastOneAccessOf.returns(() => true);
      const idNotNumeric = 'foo';
      const method = 'GET';
      const url = `/api/admin/organizations/${idNotNumeric}/places`;

      // when
      const response = await httpTestServer.request(method, url, null, null, {
        authorization: generateValidRequestAuthorizationHeader(),
      });

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return an empty list when no places is found', async function () {
      // given
      securityPreHandlers.hasAtLeastOneAccessOf.returns(() => true);
      usecases.findOrganizationPlacesLot.returns([]);

      const method = 'GET';
      const url = '/api/admin/organizations/1/places';

      // when
      const response = await httpTestServer.request(method, url, null, null, {
        authorization: generateValidRequestAuthorizationHeader(),
      });

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

      securityPreHandlers.hasAtLeastOneAccessOf.returns(() => true);
      organizationPlaceController.createOrganizationPlacesLot.callsFake((request, h) => h.response().created());

      const payload = {
        data: {
          attributes: {
            'organization-id': 1,
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
      const response = await httpTestServer.request(method, url, payload, null, {
        authorization: generateValidRequestAuthorizationHeader(),
      });

      // then
      expect(response.statusCode).to.equal(201);
    });

    it('returns forbidden access if admin member has a non super admin role', async function () {
      // given
      securityPreHandlers.hasAtLeastOneAccessOf.restore();
      securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.callsFake((request, h) =>
        h.response({ errors: new Error('forbidden') }).code(403),
      );

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
      const response = await httpTestServer.request(method, url, payload, null, {
        authorization: generateValidRequestAuthorizationHeader(),
      });

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('should reject request with HTTP code 422, when payload is incomplete', async function () {
      // given
      organizationPlaceController.createOrganizationPlacesLot.throws(new EntityValidationError({}));
      securityPreHandlers.hasAtLeastOneAccessOf.returns(() => true);
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
      const response = await httpTestServer.request(method, url, payload, null, {
        authorization: generateValidRequestAuthorizationHeader(),
      });

      // then
      expect(response.statusCode).to.equal(422);
    });
  });

  describe('GET /api/organizations/{id}/places-statistics', function () {
    it('should return HTTP code 200 when organization has the right feature activated', async function () {
      // given
      const method = 'GET';
      const url = '/api/organizations/1/place-statistics';
      const payload = {};

      checkOrganizationHasPlacesFeature.resolves(true);

      organizationPlaceController.getOrganizationPlacesStatistics.callsFake((_, h) => h.response('ok').code(200));

      // when
      const response = await httpTestServer.request(method, url, payload, null, {
        authorization: generateValidRequestAuthorizationHeader(),
      });

      // then
      expect(organizationPlaceController.getOrganizationPlacesStatistics).to.have.been.calledOnce;
      expect(response.statusCode).to.equal(200);
    });

    it('should return HTTP code 403 if organization doesnt have the right feature activated', async function () {
      // given
      const method = 'GET';
      const url = '/api/organizations/1/place-statistics';
      const payload = {};

      checkOrganizationHasPlacesFeature.callsFake(respondWithError);

      // when
      const response = await httpTestServer.request(method, url, payload, null, {
        authorization: generateValidRequestAuthorizationHeader(),
      });

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});
