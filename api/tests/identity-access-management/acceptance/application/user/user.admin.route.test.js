import { createServer } from '../../../../../server.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { QUERY_TYPES } from '../../../../../src/identity-access-management/domain/constants/user-query.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Identity Access Management | Application | Route | Admin | User', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PUT /api/admin/users/{id}/unblock', function () {
    it('unblocks user how has tried to many wrong password', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser.withRawPassword().id;
      const userLoginId = databaseBuilder.factory.buildUserLogin({ userId }).id;
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'PUT',
        url: `/api/admin/users/${userId}/unblock`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      });

      // then
      expect(response.statusCode).to.equal(200);

      expect(response.result.data.id).to.equal(`${userLoginId}`);
      expect(response.result.data.type).to.equal('user-logins');

      expect(response.result.data.attributes['user-id']).to.equal(userId);
      expect(response.result.data.attributes['failure-count']).to.equal(0);
      expect(response.result.data.attributes['temporary-blocked-until']).to.be.null;
      expect(response.result.data.attributes['blocked-at']).to.be.null;
    });
  });

  describe('GET /api/admin/users', function () {
    let superAdmin;

    beforeEach(async function () {
      superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      await databaseBuilder.factory.buildUser({ firstName: 'Ann' });
      await databaseBuilder.factory.buildUser({ firstName: 'Anne' });
      await databaseBuilder.factory.buildUser({ firstName: 'Annie' });
      await databaseBuilder.factory.buildUser({ firstName: 'Lisa' });
      await databaseBuilder.commit();
    });

    it('should return a 200 status code response with JSON API serialized', async function () {
      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/admin/users',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.have.lengthOf(5);
      expect(response.result.data[0].type).to.equal('users');
      expect(response.result.meta).to.deep.equal({ page: 1, pageSize: 10, rowCount: 5, pageCount: 1 });
    });

    it('should return a 200 status code with paginated and filtered data', async function () {
      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/admin/users?filter[firstName]=annie&page[number]=1&page[size]=1',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.meta).to.deep.equal({ page: 1, pageSize: 1, rowCount: 1, pageCount: 1 });
      expect(response.result.data).to.have.lengthOf(1);
      expect(response.result.data[0].type).to.equal('users');
    });

    it('should return a 200 status code with empty result', async function () {
      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/admin/users?filter[firstName]=foo&page[number]=1&page[size]=1',
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.meta).to.deep.equal({ page: 1, pageSize: 1, rowCount: 0, pageCount: 0 });
      expect(response.result.data).to.have.lengthOf(0);
    });

    context('When EXACT_QUERY type is settled', function () {
      context('When filters match a list of users', function () {
        it('retrieves this list of users', async function () {
          // given
          const params =
            '?filter[firstName]=Ann' + '&page[number]=1&page[size]=25' + `&queryType=${QUERY_TYPES.EXACT_QUERY}`;

          // when
          const response = await server.inject({
            method: 'GET',
            url: `/api/admin/users${params}`,
            headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
          });

          // then
          const { result, statusCode } = response;
          expect(statusCode).to.equal(200);
          expect(result.data).to.have.lengthOf(1);
        });
      });
    });

    context('When CONTAINS type is settled', function () {
      context('When filters match a list of users', function () {
        it('retrieves this list of users', async function () {
          // given
          const params =
            '?filter[firstName]=Ann' + '&page[number]=1&page[size]=25' + `&queryType=${QUERY_TYPES.CONTAINS}`;

          // when
          const response = await server.inject({
            method: 'GET',
            url: `/api/admin/users${params}`,
            headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
          });

          // then
          const { result, statusCode } = response;
          expect(statusCode).to.equal(200);
          expect(result.data).to.have.lengthOf(3);
        });
      });
    });

    describe('When user is not authenticated', function () {
      it('should respond with a 401 - unauthorized access', function () {
        // given
        // when
        const promise = server.inject({
          method: 'GET',
          url: `/api/admin/users`,
        });

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });
    });

    describe('When user has not role Super Admin', function () {
      it('should respond with a 403 - forbidden access', function () {
        // given
        const nonSuperAdminUserId = 9999;

        // when
        const promise = server.inject({
          method: 'GET',
          url: `/api/admin/users`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: nonSuperAdminUserId }),
        });

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('PATCH /api/admin/users', function () {
    let superAdmin, user;

    beforeEach(async function () {
      superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      user = databaseBuilder.factory.buildUser({ firstName: 'Ann' });
      await databaseBuilder.commit();
    });

    it('replies with 204 status code, when user details are updated', async function () {
      // given
      const options = {
        method: 'PATCH',
        url: `/api/admin/users/${user.id}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        payload: {
          data: {
            id: user.id,
            attributes: {
              'first-name': 'firstNameUpdated',
              'last-name': 'lastNameUpdated',
              email: 'emailUpdated@example.net',
              username: 'usernameUpdated',
              lang: 'en',
              locale: 'fr-FR',
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    describe('Error case', function () {
      it('replies with not authorized error', async function () {
        // given
        const options = {
          method: 'PATCH',
          url: `/api/admin/users/${superAdmin.id}`,
          payload: {
            data: {
              id: superAdmin.id,
              attributes: {
                firstName: 'firstNameUpdated',
                lastName: 'lastNameUpdated',
                email: 'emailUpdated',
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('replies with forbidden error', async function () {
        superAdmin = databaseBuilder.factory.buildUser({ email: 'partial.update@example.net' });
        await databaseBuilder.commit();

        // given
        const options = {
          method: 'PATCH',
          url: `/api/admin/users/${superAdmin.id}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
          payload: {
            data: {
              id: superAdmin.id,
              attributes: {
                'first-name': 'firstNameUpdated',
                'last-name': 'lastNameUpdated',
                email: 'emailUpdated@example.net',
              },
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('POST /api/admin/users/{id}/anonymize', function () {
    let superAdmin;
    let response;
    let userId;
    let certificationCenterId;
    let organizationId;

    beforeEach(async function () {
      superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      userId = databaseBuilder.factory.buildUser.withRawPassword().id;
      organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({
        organizationId,
        userId: userId,
      });
      certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId,
        userId: userId,
      });
      databaseBuilder.factory.buildOrganizationLearner({ userId, organizationId });
      await databaseBuilder.commit();

      response = await server.inject({
        method: 'POST',
        url: `/api/admin/users/${userId}/anonymize`,
        payload: {},
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      });
    });

    it('anomymizes user', async function () {
      // then
      expect(response.statusCode).to.equal(204);

      const user = await knex('users').where({ id: userId }).first();
      expect(user.firstName).to.equal('(anonymised)');
      expect(user.lastName).to.equal('(anonymised)');
      expect(user.email).to.be.null;
      expect(user.username).to.be.null;
      expect(user.hasBeenAnonymised).to.be.true;
    });

    it('removes authentication methods', async function () {
      // then
      expect(response.statusCode).to.equal(204);

      const authenticationMethods = await knex('authentication-methods').where({ userId });
      expect(authenticationMethods.length).to.equal(0);
    });

    it("disables user's certification center, organization learner and organisation memberships", async function () {
      // then
      expect(response.statusCode).to.equal(204);
      const certificationCenterMembership = await knex('certification-center-memberships')
        .select()
        .where({ certificationCenterId })
        .first();
      const organizationMembership = await knex('memberships').select().where({ organizationId }).first();
      const organizationLearnerMembership = await knex('organization-learners').select().where({ organizationId });

      expect(organizationMembership.disabledAt).not.to.be.null;
      expect(certificationCenterMembership.disabledAt).not.to.be.null;
      expect(organizationLearnerMembership.disabledAt).not.to.be.null;
    });
  });

  describe('POST /api/users/{id}/add-pix-authentication-method', function () {
    it('returns 201 HTTP status code', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const user = databaseBuilder.factory.buildUser({ email: null });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/users/${user.id}/add-pix-authentication-method`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        payload: {
          data: {
            id: user.id,
            attributes: {
              email: 'user@example.net',
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('POST /api/admin/users/{id}/remove-authentication', function () {
    let user;
    let options;

    beforeEach(async function () {
      user = databaseBuilder.factory.buildUser({ username: 'jhn.doe0101', email: null });
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        userId: user.id,
      });
      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({ userId: user.id });

      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      options = {
        method: 'POST',
        url: `/api/admin/users/${user.id}/remove-authentication`,
        payload: {
          data: {
            attributes: {
              type: 'USERNAME',
            },
          },
        },
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };
      return databaseBuilder.commit();
    });

    describe('POST /admin/users/:id/remove-authentication', function () {
      it('returns a 204 HTTP status code', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });

      it('sets the username to null', async function () {
        // when
        await server.inject(options);

        // then
        const updatedUser = await knex('users').where({ id: user.id }).first();
        expect(updatedUser.username).to.be.null;
      });

      it('removes PIX authenticationMethod', async function () {
        // when
        await server.inject(options);

        // then
        const pixAuthenticationMethod = await knex('authentication-methods')
          .where({ userId: user.id, identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code })
          .first();
        expect(pixAuthenticationMethod).to.be.undefined;
      });
    });
  });

  describe('POST /api/admin/users/{userId}/authentication-methods/{authenticationMethodId}', function () {
    let superAdmin;

    beforeEach(async function () {
      superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
    });

    it('returns 204 HTTP status code', async function () {
      // given
      const originUserId = databaseBuilder.factory.buildUser().id;
      const targetUserId = databaseBuilder.factory.buildUser().id;
      const authenticationMethodId = databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId: originUserId,
      }).id;
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/users/${originUserId}/authentication-methods/${authenticationMethodId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        payload: {
          data: {
            attributes: {
              'user-id': targetUserId,
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('returns 422 HTTP status code when target user has already a GAR authentication method', async function () {
      // given
      const originUserId = databaseBuilder.factory.buildUser().id;
      const targetUserId = databaseBuilder.factory.buildUser().id;
      const authenticationMethodId = databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId: originUserId,
      }).id;

      databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
        userId: targetUserId,
        externalIdentifier: 'externalId2',
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/users/${originUserId}/authentication-methods/${authenticationMethodId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
        payload: {
          data: {
            attributes: {
              'user-id': targetUserId,
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(422);
      expect(response.result.errors[0].detail).to.equal(
        `L'utilisateur ${targetUserId} a déjà une méthode de connexion GAR.`,
      );
    });
  });
});
