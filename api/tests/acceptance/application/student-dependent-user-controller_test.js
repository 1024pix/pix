const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | Student-dependent-user', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/student-dependent-user', () => {
    let organization;
    let campaign;
    let options;
    let schoolingRegistration;

    beforeEach(async () => {
      // given
      organization = databaseBuilder.factory.buildOrganization();
      schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, userId: null });
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });

      await databaseBuilder.commit();

      options = {
        method: 'POST',
        url: '/api/student-dependent-users',
        headers: {},
        payload: {
          data: {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': schoolingRegistration.firstName,
              'last-name': schoolingRegistration.lastName,
              'birthdate': schoolingRegistration.birthdate,
              'password': 'P@ssw0rd',
            }
          }
        }
      };
    });

    context('when creation is with email', () => {

      const email = 'angie@example.net';

      beforeEach(async () => {
        options.payload.data.attributes.email = email;
        options.payload.data.attributes['with-username'] = false;
      });

      it('should return an 201 status after having successfully created user and associated user to schoolingRegistration', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.attributes.email).to.equal(email);
        expect(response.result.data.attributes['first-name']).to.equal(schoolingRegistration.firstName);
        expect(response.result.data.attributes['last-name']).to.equal(schoolingRegistration.lastName);
      });

      context('when no schoolingRegistration not linked yet found', () => {

        it('should respond with a 409 - Conflict', async () => {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const schoolingRegistrationAlreadyLinked = databaseBuilder.factory.buildSchoolingRegistration({
            organizationId: organization.id,
            userId
          });
          await databaseBuilder.commit();

          options.payload.data.attributes['first-name'] = schoolingRegistrationAlreadyLinked.firstName;
          options.payload.data.attributes['last-name'] = schoolingRegistrationAlreadyLinked.lastName;
          options.payload.data.attributes['birthdate'] = schoolingRegistrationAlreadyLinked.birthdate;

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0].detail).to.equal('L\'élève est déjà rattaché à un compte utilisateur.');
        });
      });

      context('when a field is not valid', () => {

        it('should respond with a 422 - Unprocessable Entity', async () => {
          // given
          options.payload.data.attributes.email = 'not valid email';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(422);
        });
      });
    });

    context('when creation is with username', () => {

      const username = 'angie.go1234';

      beforeEach(async () => {
        options.payload.data.attributes.username = username;
        options.payload.data.attributes['with-username'] = true;
      });

      it('should return an 201 status after having successfully created user and associated user to schoolingRegistration', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.attributes.username).to.equal(username);
        expect(response.result.data.attributes['first-name']).to.equal(schoolingRegistration.firstName);
        expect(response.result.data.attributes['last-name']).to.equal(schoolingRegistration.lastName);
      });

      context('when username is already taken', () => {

        it('should respond with a 422 - Unprocessable entity', async () => {
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

  describe('POST /api/student-dependent-user/password-update', () => {

    let organizationId;
    let options;

    beforeEach(async () => {
      organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: true }).id;
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId, userId });

      await databaseBuilder.commit();

      options = {
        method: 'POST',
        url: '/api/student-dependent-users/password-update',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        payload: {
          data: {
            attributes: {
              'organization-id': organizationId,
              'password': 'P@ssw0rd',
              'student-id': null,
            }
          }
        }
      };
    });

    it('should return a 200 status after having successfully updated the password', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const schoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId, userId
      }).id;
      options.payload.data.attributes['student-id'] = schoolingRegistrationId;

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a 404 status when schoolingRegistration does not exist', async () => {
      // given
      options.payload.data.attributes['student-id'] = 0;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return a 404 status when schoolingRegistration\'s userId does not exist', async () => {
      // given
      const schoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId, userId: null
      }).id;
      options.payload.data.attributes['student-id'] = schoolingRegistrationId;

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return a 403 status when schoolingRegistration does not belong to the right organization', async () => {
      // given
      const wrongOrganization = databaseBuilder.factory.buildOrganization();
      const schoolingRegistrationWithWrongOrganization = databaseBuilder.factory.buildSchoolingRegistration({
        organizationId: wrongOrganization.id
      });
      await databaseBuilder.commit();

      options.payload.data.attributes['student-id'] = schoolingRegistrationWithWrongOrganization.id;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

});
