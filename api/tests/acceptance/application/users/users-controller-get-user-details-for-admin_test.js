const {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  sinon,
} = require('../../../test-helper');

const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-get-user-details-for-admin', function () {
  let options;
  let server;
  let user;
  let clock;

  beforeEach(async function () {
    clock = sinon.useFakeTimers({
      now: Date.now(),
      toFake: ['Date'],
    });
    user = databaseBuilder.factory.buildUser({});
    await databaseBuilder.commit();
    options = {
      method: 'GET',
      url: `/api/admin/users/${user.id}`,
      payload: {},
      headers: {},
    };
    server = await createServer();
  });

  afterEach(function () {
    clock.restore();
  });

  describe('GET /admin/users/:id', function () {
    describe('Resource access management', function () {
      it('should respond with a 403 - forbidden access - if requested user is not the same as authenticated user', async function () {
        // given
        const otherUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(otherUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Success case', function () {
      beforeEach(async function () {
        const superAdmin = await insertUserWithRoleSuperAdmin();
        options.headers.authorization = generateValidRequestAuthorizationHeader(superAdmin.id);

        await databaseBuilder.commit();
      });

      it('should return 200', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return user serialized', async function () {
        // when
        const response = await server.inject(options);

        const expectedScorecardJSONApi = {
          data: {
            attributes: {
              cgu: true,
              'created-at': new Date(),
              email: user.email,
              'email-confirmed-at': null,
              'first-name': user.firstName,
              lang: 'fr',
              'last-logged-at': new Date(),
              'last-name': user.lastName,
              'last-pix-certif-terms-of-service-validated-at': null,
              'last-pix-orga-terms-of-service-validated-at': null,
              'last-terms-of-service-validated-at': null,
              'pix-certif-terms-of-service-accepted': false,
              'pix-orga-terms-of-service-accepted': false,
              username: user.username,
            },
            id: `${user.id}`,
            relationships: {
              'authentication-methods': {
                data: [],
              },
              'organization-learners': {
                data: [],
              },
              'schooling-registrations': {
                data: [],
              },
              profile: {
                links: {
                  related: `/api/admin/users/${user.id}/profile`,
                },
              },
              'organization-memberships': {
                links: {
                  related: `/api/admin/users/${user.id}/organizations`,
                },
              },
              participations: {
                links: {
                  related: `/api/admin/users/${user.id}/participations`,
                },
              },
            },
            type: 'users',
          },
          included: undefined,
        };

        // then
        expect(response.result.data).to.deep.equal(expectedScorecardJSONApi.data);
        expect(response.result.included).to.deep.equal(expectedScorecardJSONApi.included);
      });
    });
  });
});
