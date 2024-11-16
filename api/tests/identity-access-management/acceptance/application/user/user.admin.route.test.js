import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
  sinon,
} from '../../../../test-helper.js';

describe('Acceptance | Identity Access Management | Application | Route | Admin | User', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PUT /admin/users/{id}/unblock', function () {
    it('unblocks user how has tried to many wrong password', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser.withRawPassword().id;
      const userLoginId = databaseBuilder.factory.buildUserLogin({ userId }).id;
      const superAdmin = await insertUserWithRoleSuperAdmin();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'PUT',
        url: `/api/admin/users/${userId}/unblock`,
        headers: { authorization: generateValidRequestAuthorizationHeader(superAdmin.id) },
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
    context('When filters match a list of users', function () {
      let requestOptions;

      beforeEach(async function () {
        const user = await insertUserWithRoleSuperAdmin();
        const params = '?filter[firstName]=Ann' + '&page[number]=1&page[size]=25';

        requestOptions = {
          method: 'GET',
          url: `/api/admin/users${params}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        };

        await databaseBuilder.factory.buildUser({ firstName: 'Ann' });
        await databaseBuilder.factory.buildUser({ firstName: 'Anne' });
        await databaseBuilder.factory.buildUser({ firstName: 'Annie' });
        await databaseBuilder.commit();
      });

      it('retrieves this list of users', async function () {
        // when
        const response = await server.inject(requestOptions);
        // then
        const { result, statusCode } = response;
        expect(statusCode).to.equal(200);
        expect(result.data).to.have.length(3);
      });
    });
  });

  describe('PATCH /api/admin/users', function () {
    let user;

    beforeEach(async function () {
      user = await insertUserWithRoleSuperAdmin();
    });

    it('replies with 200 status code, when user details are updated', async function () {
      // given
      const options = {
        method: 'PATCH',
        url: `/api/admin/users/${user.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
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
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.id).to.equal('1234');
      expect(response.result.data.type).to.equal('users');
      expect(response.result.data.attributes.email).to.equal('emailUpdated@example.net');
      expect(response.result.data.relationships['organization-learners']).to.not.be.undefined;
      expect(response.result.data.relationships['authentication-methods']).to.not.be.undefined;
    });

    describe('Error case', function () {
      it('replies with not authorized error', async function () {
        // given
        const options = {
          method: 'PATCH',
          url: `/api/admin/users/${user.id}`,
          payload: {
            data: {
              id: user.id,
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
        user = databaseBuilder.factory.buildUser({ email: 'partial.update@example.net' });
        await databaseBuilder.commit();

        // given
        const options = {
          method: 'PATCH',
          url: `/api/admin/users/${user.id}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          payload: {
            data: {
              id: user.id,
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

  describe('GET /admin/users/{id}', function () {
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
          headers: {
            authorization: generateValidRequestAuthorizationHeader(otherUserId),
          },
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Success case', function () {
      it('returns 200 and user serialized', async function () {
        // given
        const superAdmin = await insertUserWithRoleSuperAdmin();

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
          locale: 'fr-FR',
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

  describe('POST /admin/users/{id}/anonymize', function () {
    let server;
    let superAdmin;
    let response;
    let userId;
    let certificationCenterId;
    let organizationId;

    beforeEach(async function () {
      server = await createServer();
      superAdmin = await insertUserWithRoleSuperAdmin();
      const user = databaseBuilder.factory.buildUser.withRawPassword();
      userId = user.id;
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
        headers: { authorization: generateValidRequestAuthorizationHeader(superAdmin.id) },
      });
    });

    it('anomymizes user', async function () {
      // then
      expect(response.statusCode).to.equal(200);

      const updatedUserAttributes = response.result.data.attributes;

      expect(updatedUserAttributes['first-name']).to.equal('(anonymised)');
      expect(updatedUserAttributes['last-name']).to.equal('(anonymised)');
      expect(updatedUserAttributes.email).to.be.null;
      expect(updatedUserAttributes.username).to.be.null;

      expect(updatedUserAttributes['has-been-anonymised']).to.be.true;
      expect(updatedUserAttributes['anonymised-by-full-name']).to.equal('Super Papa');
      expect(updatedUserAttributes['updated-at']).to.exist;
    });

    it('removes authentication methods', async function () {
      // then
      const updatedUserRelationships = response.result.data.relationships;
      expect(updatedUserRelationships['authentication-methods'].data).to.be.empty;
    });

    it("disables user's certification center, organization learner and organisation memberships", async function () {
      // then
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
});
