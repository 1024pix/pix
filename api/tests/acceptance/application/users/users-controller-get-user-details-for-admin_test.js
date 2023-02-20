import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  sinon,
} from '../../../test-helper';

import createServer from '../../../../server';

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
        const blockedAt = new Date('2022-12-07');
        const temporaryBlockedUntil = new Date('2022-12-06');
        const userLoginId = databaseBuilder.factory.buildUserLogin({
          failureCount: 666,
          blockedAt,
          temporaryBlockedUntil,
          userId: user.id,
        }).id;

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
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.id).to.deep.equal(`${user.id}`);
        expect(response.result.data.type).to.deep.equal('users');

        expect(response.result.data.attributes).to.deep.equal({
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
          'has-been-anonymised': false,
          'anonymised-by-full-name': null,
        });

        expect(response.result.data.relationships).to.deep.equal({
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
          'user-login': {
            data: {
              id: `${userLoginId}`,
              type: 'userLogins',
            },
          },
          participations: {
            links: {
              related: `/api/admin/users/${user.id}/participations`,
            },
          },
        });
        expect(response.result.included).to.deep.equal([
          {
            id: `${userLoginId}`,
            type: 'userLogins',
            attributes: {
              'failure-count': 666,
              'blocked-at': blockedAt,
              'temporary-blocked-until': temporaryBlockedUntil,
            },
          },
        ]);
      });
    });
  });
});
