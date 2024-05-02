import { identityAccessManagementRoutes } from '../../../../src/identity-access-management/application/routes.js';
import { expect, HttpTestServer } from '../../../test-helper.js';

const routesUnderTest = identityAccessManagementRoutes[0];

describe('Integration | Identity Access Management | Application | Route | User', function () {
  let httpTestServer;

  beforeEach(async function () {
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(routesUnderTest);
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
});
