const {
  databaseBuilder,
  expect,
  knex,
  generateValidRequestAuthorizationHeader,
} = require('../../test-helper');

const createServer = require('../../../server');

describe('Acceptance | Controller | Schooling-registration-dependent-user', function() {

  let server;

  beforeEach(async function() {
    server = await createServer();
  });

  afterEach(async function() {
    await knex('authentication-methods').delete();
  });

  describe('POST /api/schooling-registration-dependent-users', function() {
    let organization;
    let campaign;
    let options;
    let schoolingRegistration;

    beforeEach(async function() {
      // given
      organization = databaseBuilder.factory.buildOrganization();
      schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, userId: null });
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });

      await databaseBuilder.commit();

      options = {
        method: 'POST',
        url: '/api/schooling-registration-dependent-users',
        payload: {
          data: {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': schoolingRegistration.firstName,
              'last-name': schoolingRegistration.lastName,
              'birthdate': schoolingRegistration.birthdate,
              'password': 'P@ssw0rd',
            },
          },
        },
      };
    });

    context('when creation is with email', function() {

      const email = 'angie@example.net';

      beforeEach(async function() {
        options.payload.data.attributes.email = email;
        options.payload.data.attributes['with-username'] = false;
      });

      it('should return an 204 status after having successfully created user and associated user to schoolingRegistration', async function() {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });

      context('when no schoolingRegistration not linked yet found', function() {

        it('should respond with a 409 - Conflict', async function() {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const schoolingRegistrationAlreadyLinked = databaseBuilder.factory.buildSchoolingRegistration({
            organizationId: organization.id,
            userId,
          });
          await databaseBuilder.commit();

          options.payload.data.attributes['first-name'] = schoolingRegistrationAlreadyLinked.firstName;
          options.payload.data.attributes['last-name'] = schoolingRegistrationAlreadyLinked.lastName;
          options.payload.data.attributes['birthdate'] = schoolingRegistrationAlreadyLinked.birthdate;

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0].detail).to.equal('Un compte existe déjà pour l‘élève dans le même établissement.');
        });
      });

      context('when a field is not valid', function() {

        it('should respond with a 422 - Unprocessable Entity', async function() {
          // given
          options.payload.data.attributes.email = 'not valid email';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(422);
        });
      });
    });

    context('when creation is with username', function() {

      const username = 'angie.go1234';

      beforeEach(async function() {
        options.payload.data.attributes.username = username;
        options.payload.data.attributes['with-username'] = true;
      });

      it('should return a 204 status after having successfully created user and associated user to schoolingRegistration', async function() {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });

      context('when username is already taken', function() {

        it('should respond with a 422 - Unprocessable entity', async function() {
          // given
          databaseBuilder.factory.buildUser({ username });
          await databaseBuilder.commit();

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(422);
          expect(response.result.errors[0].detail).to.equal('Cet identifiant n’est plus disponible, merci de recharger la page.');
        });
      });
    });
  });

  describe('POST /api/schooling-registration-dependent-users/generate-username-password', function() {

    let organizationId;
    let schoolingRegistrationId;
    let options;

    beforeEach(async function() {
      organizationId = databaseBuilder.factory.buildOrganization({
        type: 'SCO',
        isManagingStudents: true,
      }).id;
      const userId = databaseBuilder.factory.buildUser.withRawPassword({
        username: null,
      }).id;
      databaseBuilder.factory.buildMembership({ organizationId, userId });
      schoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId, userId,
      }).id;

      await databaseBuilder.commit();

      options = {
        method: 'POST',
        url: '/api/schooling-registration-dependent-users/generate-username-password',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        payload: {
          data: {
            attributes: {
              'organization-id': organizationId,
              'schooling-registration-id': schoolingRegistrationId,
            },
          },
        },
      };
    });

    it('should return a 200 status after having successfully generated username and temporary password', async function() {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);

    });

    it('should return a 404 status when schoolingRegistration does not exist', async function() {
      // given
      options.payload.data.attributes['schooling-registration-id'] = 0;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return a 404 status when schoolingRegistration\'s userId does not exist', async function() {
      // given
      const schoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId,
        userId: null,
      }).id;
      options.payload.data.attributes['schooling-registration-id'] = schoolingRegistrationId;

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return a 403 status when student does not belong to the same organization as schoolingRegistration', async function() {
      // given
      options.payload.data.attributes['organization-id'] = 0;
      options.payload.data.attributes['schooling-registration-id'] = schoolingRegistrationId;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('should return a 403 status when user does not belong to the same organization as schoolingRegistration', async function() {
      // given
      const wrongOrganization = databaseBuilder.factory.buildOrganization();
      const schoolingRegistrationWithWrongOrganization = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: wrongOrganization.id,
      });
      await databaseBuilder.commit();

      options.payload.data.attributes['schooling-registration-id'] = schoolingRegistrationWithWrongOrganization.id;
      options.payload.data.attributes['organization-id'] = wrongOrganization.id;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('POST /api/schooling-registration-dependent-users/password-update', function() {

    let organizationId;
    let options;

    beforeEach(async function() {
      organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId, userId });

      await databaseBuilder.commit();

      options = {
        method: 'POST',
        url: '/api/schooling-registration-dependent-users/password-update',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        payload: {
          data: {
            attributes: {
              'organization-id': organizationId,
              'schooling-registration-id': null,
            },
          },
        },
      };
    });

    it('should return a 200 status after having successfully updated the password', async function() {
      // given
      const userId = databaseBuilder.factory.buildUser.withRawPassword().id;
      const schoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId, userId,
      }).id;
      options.payload.data.attributes['schooling-registration-id'] = schoolingRegistrationId;

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a 404 status when schoolingRegistration does not exist', async function() {
      // given
      options.payload.data.attributes['schooling-registration-id'] = 0;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return a 404 status when schoolingRegistration\'s userId does not exist', async function() {
      // given
      const schoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId, userId: null,
      }).id;
      options.payload.data.attributes['schooling-registration-id'] = schoolingRegistrationId;

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return a 403 status when user does not belong to the same organization as schoolingRegistration', async function() {
      // given
      const wrongOrganization = databaseBuilder.factory.buildOrganization();
      const schoolingRegistrationWithWrongOrganization = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: wrongOrganization.id,
      });
      await databaseBuilder.commit();

      options.payload.data.attributes['schooling-registration-id'] = schoolingRegistrationWithWrongOrganization.id;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

});
