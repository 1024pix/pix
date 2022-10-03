const {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  sinon,
} = require('../../../test-helper');

const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-get-user-details-for-admin', function () {
  let clock;
  let server;

  beforeEach(async function () {
    clock = sinon.useFakeTimers({
      now: Date.now(),
      toFake: ['Date'],
    });

    server = await createServer();
  });

  afterEach(function () {
    clock.restore();
  });

  describe('GET /admin/users/:id', function () {
    describe('Resource access management', function () {
      it('should respond with a 403 - forbidden access - if requested user is not the same as authenticated user', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        await databaseBuilder.commit();

        const otherUserId = 9999;

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/admin/users/${user.id}`,
          payload: {},
          headers: {
            authorization: generateValidRequestAuthorizationHeader(otherUserId),
          },
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Success case', function () {
      it('should return 200 and user serialized', async function () {
        // given
        const superAdmin = await insertUserWithRoleSuperAdmin();

        const user = databaseBuilder.factory.buildUser({ username: 'brice.glace0712' });

        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/admin/users/${user.id}`,
          payload: {},
          headers: {
            authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
          },
        });

        // then
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
              'certification-center-memberships': {
                links: {
                  related: `/api/admin/users/${user.id}/certification-center-memberships`,
                },
              },
              'organization-learners': {
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

        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.deep.equal(expectedScorecardJSONApi.data);
        expect(response.result.included).to.deep.equal(expectedScorecardJSONApi.included);
      });
    });
  });
});
