import { identityAccessManagementRoutes } from '../../../../../src/identity-access-management/application/routes.js';
import { userController } from '../../../../../src/identity-access-management/application/user/user.controller.js';
import { config } from '../../../../../src/shared/config.js';
import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  HttpTestServer,
  sinon,
} from '../../../../test-helper.js';

const routesUnderTest = identityAccessManagementRoutes[0];

describe('Integration | Identity Access Management | Application | Route | User', function () {
  let httpTestServer;

  beforeEach(async function () {
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(routesUnderTest);
    httpTestServer.setupAuthentication();
  });

  describe('POST /api/users', function () {
    context('when user create account before joining campaign', function () {
      it('should return HTTP 201', async function () {
        // given / when
        const response = await httpTestServer.request('POST', '/api/users', {
          data: {
            attributes: {
              'first-name': 'marine',
              'last-name': 'test',
              email: 'test1@example.net',
              username: null,
              password: 'Password123',
              cgu: true,
              'must-validate-terms-of-service': false,
              'has-seen-assessment-instructions': false,
              'has-seen-new-dashboard-info': false,
              lang: 'fr',
              'is-anonymous': false,
            },
            type: 'users',
          },
          meta: {
            'campaign-code': 'TRWYWV411',
          },
        });

        // then
        expect(response.statusCode).to.equal(201);
      });

      it('should return HTTP 400', async function () {
        // given
        const payload = {};

        const url = '/api/users';

        // when
        const response = await httpTestServer.request('POST', url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('GET /api/user/validate-email', function () {
    context('when redirect_url is invalid', function () {
      it('should return HTTP 400 if not a URI', async function () {
        // when
        const response = await httpTestServer.request('GET', '/api/users/validate-email?redirect_url=XXX');

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should return HTTP 400 if not a https URI', async function () {
        // when
        const response = await httpTestServer.request('GET', '/api/users/validate-email?redirect_url=http://test.com');

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when token is invalid', function () {
      it('should return HTTP 400', async function () {
        // when
        const response = await httpTestServer.request('GET', '/api/users/validate-email?token=XXX');

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('DELETE /api/users/me', function () {
    context('when user is not authenticated', function () {
      it('returns a 401 HTTP status code', async function () {
        // given
        const url = '/api/users/me';

        // when
        const response = await httpTestServer.request('DELETE', url);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('when user cannot self delete their account', function () {
      beforeEach(async function () {
        sinon.stub(config.featureToggles, 'isSelfAccountDeletionEnabled').value(false);
      });

      it('returns a 403 HTTP status code', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;

        const url = '/api/users/me';
        const headers = {
          authorization: generateValidRequestAuthorizationHeader(userId),
        };

        // when
        const response = await httpTestServer.request('DELETE', url, null, null, headers);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/certification-point-of-contacts/me', function () {
    it('returns controller success response HTTP code', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const headers = {
        authorization: generateValidRequestAuthorizationHeader(userId),
      };
      sinon.stub(userController, 'getCertificationPointOfContact').callsFake((request, h) => h.response().code(200));

      // when
      const result = await httpTestServer.request(
        'GET',
        '/api/certification-point-of-contacts/me',
        null,
        null,
        headers,
      );

      // then
      expect(result.statusCode).to.equal(200);
    });
  });

  describe('PATCH /api/users/{id}/has-seen-challenge-tooltip/{challengeType}', function () {
    it('should return 400 - Bad request when challengeType is not valid', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const headers = {
        authorization: generateValidRequestAuthorizationHeader(userId),
      };
      const url = `/api/users/${userId}/has-seen-challenge-tooltip/invalid`;

      // when
      const response = await httpTestServer.request('PATCH', url, {}, null, headers);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 200 when challengeType is valid', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const headers = {
        authorization: generateValidRequestAuthorizationHeader(userId),
      };
      const url = `/api/users/${userId}/has-seen-challenge-tooltip/other`;

      // when
      const response = await httpTestServer.request('PATCH', url, {}, null, headers);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
