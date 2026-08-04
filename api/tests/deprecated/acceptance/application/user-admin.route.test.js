import sinon from 'sinon';

import { createServer } from '../../../../server.js';
import { expect } from '../../../test-helper.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Acceptance | Deprecated | Application | Route | User admin', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/users/{id}', function () {
    let clock;

    beforeEach(async function () {
      clock = sinon.useFakeTimers({
        now: Date.now(),
        toFake: ['Date'],
      });
    });

    afterEach(function () {
      clock.restore();
    });

    describe('Resource access management', function () {
      it('responds with a 403 - forbidden access - if requested user is not the same as authenticated user', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        await databaseBuilder.commit();

        const otherUserId = 9999;

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/admin/users/${user.id}`,
          payload: {},
          headers: generateAuthenticatedUserRequestHeaders({ userId: otherUserId }),
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Success case', function () {
      it('returns 200 and user serialized', async function () {
        // given
        const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
        await databaseBuilder.commit();

        const user = databaseBuilder.factory.buildUser({ username: 'brice.glace0712', locale: 'fr-FR' });
        const blockedAt = new Date('2022-12-07');
        const temporaryBlockedUntil = new Date('2022-12-06');
        const userLoginId = databaseBuilder.factory.buildUserLogin({
          failureCount: 666,
          blockedAt,
          temporaryBlockedUntil,
          userId: user.id,
          lastLoggedAt: new Date(),
        }).id;

        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/admin/users/${user.id}`,
          payload: {},
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
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
          locale: 'fr-FR',
          'last-logged-at': new Date(),
          'last-name': user.lastName,
          'last-pix-certif-terms-of-service-validated-at': null,
          'last-pix-orga-terms-of-service-validated-at': null,
          'last-pix-app-terms-of-service-validated-at': null,
          'pix-certif-terms-of-service-accepted': false,
          'pix-orga-terms-of-service-accepted': false,
          'pix-app-terms-of-service-accepted': true,
          username: user.username,
          'has-been-anonymised': false,
          'has-been-anonymised-by': null,
          'anonymised-by-full-name': null,
          'is-pix-agent': false,
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
          'certification-courses': {
            links: {
              related: `/api/admin/users/${user.id}/certification-courses`,
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
          'last-application-connections': {
            data: [],
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

      describe('When user has a learner without firstName and lastName (ex: from a simplified campaign)', function () {
        it('returns 200', async function () {
          // given
          const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
          const user = databaseBuilder.factory.buildUser();
          databaseBuilder.factory.buildOrganizationLearner({ firstName: '', lastName: '', userId: user.id });
          await databaseBuilder.commit();

          // when
          const response = await server.inject({
            method: 'GET',
            url: `/api/admin/users/${user.id}`,
            headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
          });

          // then
          expect(response.statusCode).to.equal(200);
        });
      });
    });
  });
});
