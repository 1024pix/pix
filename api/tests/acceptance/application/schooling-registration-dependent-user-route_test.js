const {
  databaseBuilder,
  expect,
  knex,
  generateValidRequestAuthorizationHeader,
} = require('../../test-helper');

const createServer = require('../../../server');
const { featureToggles } = require('../../../lib/config');

describe('Acceptance | Route | Schooling-registration-dependent-user', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  afterEach(async () => {
    await knex('authentication-methods').delete();
  });

  describe('POST /api/schooling-registration-dependent-users', () => {
    let organization;
    let campaign;
    let options;
    let schoolingRegistration;

    beforeEach(async () => {
      // given
      organization = databaseBuilder.factory.buildOrganization();
      schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, userId: null, nationalStudentId: 'salut' });
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

    context('when creation is with email', () => {

      const email = 'angie@example.net';

      beforeEach(async () => {
        options.payload.data.attributes.email = email;
        options.payload.data.attributes['with-username'] = false;
      });

      it('should return an 204 status after having successfully created user and associated user to schoolingRegistration', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });

      context('when no schoolingRegistration not linked yet found', () => {

        it('should respond with a 409 - Conflict', async () => {
          // given
          const userId = databaseBuilder.factory.buildUser().id;
          const schoolingRegistrationAlreadyLinked = databaseBuilder.factory.buildSchoolingRegistration({
            firstName: 'josé',
            lastName: 'bové',
            birthdate: '2020-01-01',
            organizationId: organization.id,
            userId,
            nationalStudentId: 'coucou',
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

      it('should return a 204 status after having successfully created user and associated user to schoolingRegistration', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
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

  describe('POST /api/schooling-registration-dependent-users/generate-username-password', () => {

    let organizationId;
    let schoolingRegistrationId;
    let options;

    beforeEach(async () => {
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

    it('should return a 200 status after having successfully generated username and temporary password', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);

    });

    it('should return a 404 status when schoolingRegistration does not exist', async () => {
      // given
      options.payload.data.attributes['schooling-registration-id'] = schoolingRegistrationId + 1;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return a 404 status when schoolingRegistration\'s userId does not exist', async () => {
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

    it('should return a 403 status when student does not belong to the same organization as schoolingRegistration', async () => {
      // given
      options.payload.data.attributes['organization-id'] = organizationId + 1;
      options.payload.data.attributes['schooling-registration-id'] = schoolingRegistrationId;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('should return a 403 status when user does not belong to the same organization as schoolingRegistration', async () => {
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

  describe('POST /api/schooling-registration-dependent-users/password-update', () => {

    let organizationId;
    let options;

    beforeEach(async () => {
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

    it('should return a 200 status after having successfully updated the password', async () => {
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

    it('should return a 404 status when schoolingRegistration does not exist', async () => {
      // given
      options.payload.data.attributes['schooling-registration-id'] = 1;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return a 404 status when schoolingRegistration\'s userId does not exist', async () => {
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

    it('should return a 403 status when user does not belong to the same organization as schoolingRegistration', async () => {
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

  describe('POST /api/schooling-registration-dependent-users/recover-account', () => {

    it('should return a 200 status and student information for account recovery', async () => {
      // given
      featureToggles.isScoAccountRecoveryEnabled = true;

      const studentInformation = {
        ineIna: '123456789AA',
        firstName: 'Jude',
        lastName: 'Law',
        birthdate: '2016-06-01',
      };
      const user = databaseBuilder.factory.buildUser.withRawPassword({
        id: 8,
        firstName: 'Judy',
        lastName: 'Howl',
        email: 'jude.law@example.net',
        username: 'jude.law0601',
      });
      const organization = databaseBuilder.factory.buildOrganization({
        id: 7,
        name: 'Collège Hollywoodien',
      });
      const latestOrganization = databaseBuilder.factory.buildOrganization({
        id: 2,
        name: 'Super Collège Hollywoodien',
      });
      databaseBuilder.factory.buildSchoolingRegistration({
        userId: user.id,
        nationalStudentId: studentInformation.ineIna,
        firstName: studentInformation.firstName,
        lastName: studentInformation.lastName,
        birthdate: studentInformation.birthdate,
        organizationId: organization.id,
        updatedAt: new Date('2005-01-01T15:00:00Z'),
      });
      databaseBuilder.factory.buildSchoolingRegistration({
        userId: user.id,
        nationalStudentId: studentInformation.ineIna,
        firstName: studentInformation.firstName,
        lastName: studentInformation.lastName,
        birthdate: studentInformation.birthdate,
        organizationId: latestOrganization.id,
        updatedAt: new Date('2010-01-01T15:00:00Z'),
      });

      await databaseBuilder.commit();

      const options = {
        method: 'POST',
        url: '/api/schooling-registration-dependent-users/recover-account',
        payload: {
          data: {
            type: 'student-information',
            attributes: {
              'ine-ina': studentInformation.ineIna,
              'first-name': studentInformation.firstName,
              'last-name': studentInformation.lastName,
              'birthdate': studentInformation.birthdate,
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);

      expect(response.result.data).to.deep.equal({
        type: 'student-information-for-account-recoveries',
        attributes: {
          'user-id': 8,
          'first-name': 'Judy',
          'last-name': 'Howl',
          'username': 'jude.law0601',
          'email': 'jude.law@example.net',
          'latest-organization-name': 'Super Collège Hollywoodien',
        },
      });
    });

    it('should return 404 if IS_SCO_ACCOUNT_RECOVERY_ENABLED is not enabled', async () => {
      // given
      featureToggles.isScoAccountRecoveryEnabled = false;

      const studentInformation = {
        ineIna: '123456789AA',
        firstName: 'Jude',
        lastName: 'Law',
        birthdate: '2016-06-01',
      };

      const options = {
        method: 'POST',
        url: '/api/schooling-registration-dependent-users/recover-account',
        payload: {
          data: {
            type: 'student-information',
            attributes: {
              'ine-ina': studentInformation.ineIna,
              'first-name': studentInformation.firstName,
              'last-name': studentInformation.lastName,
              'birthdate': studentInformation.birthdate,
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });
  });

});
