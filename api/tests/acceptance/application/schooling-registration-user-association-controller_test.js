const {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  generateIdTokenForExternalUser,
  knex,
} = require('../../test-helper');

const createServer = require('../../../server');
const Membership = require('../../../lib/domain/models/Membership');
const AuthenticationMethod = require('../../../lib/domain/models/AuthenticationMethod');

describe('Acceptance | Controller | Schooling-registration-user-associations', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/schooling-registration-user-associations/', () => {
    let organization;
    let campaign;
    let options;
    let schoolingRegistration;
    let user;

    beforeEach(async () => {
      // given
      options = {
        method: 'POST',
        url: '/api/schooling-registration-user-associations',
        headers: {},
        payload: {},
      };

      user = databaseBuilder.factory.buildUser();
      organization = databaseBuilder.factory.buildOrganization({ identityProvider: 'SCO' });
      schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, userId: null, studentNumber: '123A' });
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });

      await databaseBuilder.commit();
    });

    context('associate user with firstName, lastName and birthdate', () => {
      it('should return an 200 status after having successfully associated user to schoolingRegistration', async () => {
        // given
        options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
        options.payload.data = {
          attributes: {
            'campaign-code': campaign.code,
            'first-name': schoolingRegistration.firstName,
            'last-name': schoolingRegistration.lastName,
            'birthdate': schoolingRegistration.birthdate,
          },
        };
        options.url += '?withReconciliation=true';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });

      context('When student is already reconciled in the same organization', () => {

        it('should return a schooling registration already linked error (short code R31 when account with email)', async () => {
          // given
          const userWithEmailOnly = databaseBuilder.factory.buildUser({
            username: null,
            email: 'john.harry@example.net',
          });
          const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, userId: null });
          schoolingRegistration.userId = userWithEmailOnly.id;
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta: { shortCode: 'R31', value: 'j***@example.net', userId: userWithEmailOnly.id },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithEmailOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': schoolingRegistration.firstName,
              'last-name': schoolingRegistration.lastName,
              'birthdate': schoolingRegistration.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });

        it('should return a schooling registration already linked error (short code R32 when connected with username)', async () => {
          // given
          const userWithUsernameOnly = databaseBuilder.factory.buildUser({
            username: 'john.harry0702',
            email: null,
          });
          const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, userId: null });
          schoolingRegistration.userId = userWithUsernameOnly.id;
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta: { shortCode: 'R32', value: 'j***.h***2', userId: userWithUsernameOnly.id },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithUsernameOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': schoolingRegistration.firstName,
              'last-name': schoolingRegistration.lastName,
              'birthdate': schoolingRegistration.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });

        it('should return a schooling registration already linked error (short code R33 when account with samlId)', async () => {
          // given
          const userWithSamlOnly = databaseBuilder.factory.buildUser({
            username: null,
            email: null,
          });
          databaseBuilder.factory.buildAuthenticationMethod({ identityProvider: AuthenticationMethod.identityProviders.GAR, externalIdentifier: '12345678', userId: userWithSamlOnly.id });

          const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, userId: null });
          schoolingRegistration.userId = userWithSamlOnly.id;
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta: { shortCode: 'R33', value: null, userId: userWithSamlOnly.id },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithSamlOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': schoolingRegistration.firstName,
              'last-name': schoolingRegistration.lastName,
              'birthdate': schoolingRegistration.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });
      });

      context('When student is already reconciled in another organization', () => {

        it('should return a schooling registration already linked error (short code R13 when account with samlId)', async () => {
          // given
          const userWithSamlIdOnly = databaseBuilder.factory.buildUser({
            email: null,
            username: null,
          });
          databaseBuilder.factory.buildAuthenticationMethod({ identityProvider: AuthenticationMethod.identityProviders.GAR, externalIdentifier: '12345678', userId: userWithSamlIdOnly.id });

          const otherSchoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration();
          otherSchoolingRegistration.nationalStudentId = schoolingRegistration.nationalStudentId;
          otherSchoolingRegistration.birthdate = schoolingRegistration.birthdate;
          otherSchoolingRegistration.firstName = schoolingRegistration.firstName;
          otherSchoolingRegistration.lastName = schoolingRegistration.lastName;
          otherSchoolingRegistration.userId = userWithSamlIdOnly.id;
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta: { shortCode: 'R13', value: null, userId: userWithSamlIdOnly.id },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithSamlIdOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': schoolingRegistration.firstName,
              'last-name': schoolingRegistration.lastName,
              'birthdate': schoolingRegistration.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });

        it('should return a schooling registration already linked error (short code R11 when account with email)', async () => {
          // given
          const userWithEmailOnly = databaseBuilder.factory.buildUser({
            username: null,
            email: 'john.harry@example.net',
          });
          const otherSchoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration();
          otherSchoolingRegistration.nationalStudentId = schoolingRegistration.nationalStudentId;
          otherSchoolingRegistration.birthdate = schoolingRegistration.birthdate;
          otherSchoolingRegistration.firstName = schoolingRegistration.firstName;
          otherSchoolingRegistration.lastName = schoolingRegistration.lastName;
          otherSchoolingRegistration.userId = userWithEmailOnly.id;

          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta: { shortCode: 'R11', value: 'j***@example.net', userId: userWithEmailOnly.id },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithEmailOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': schoolingRegistration.firstName,
              'last-name': schoolingRegistration.lastName,
              'birthdate': schoolingRegistration.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });

        it('should return a schooling registration already linked error (short code R12 when connected with username)', async () => {
          // given
          const userWithUsernameOnly = databaseBuilder.factory.buildUser({
            email: null,
            username: 'john.harry0702',
          });

          const otherSchoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration();
          otherSchoolingRegistration.nationalStudentId = schoolingRegistration.nationalStudentId;
          otherSchoolingRegistration.birthdate = schoolingRegistration.birthdate;
          otherSchoolingRegistration.firstName = schoolingRegistration.firstName;
          otherSchoolingRegistration.lastName = schoolingRegistration.lastName;
          otherSchoolingRegistration.userId = userWithUsernameOnly.id;
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta: { shortCode: 'R12', value: 'j***.h***2', userId: userWithUsernameOnly.id },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithUsernameOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': schoolingRegistration.firstName,
              'last-name': schoolingRegistration.lastName,
              'birthdate': schoolingRegistration.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });

      });

      context('when no schoolingRegistration can be associated because birthdate does not match', () => {

        it('should return an 404 NotFoundError error', async () => {
          // given
          const options = {
            method: 'POST',
            url: '/api/schooling-registration-user-associations/',
            headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
            payload: {
              data: {
                attributes: {
                  'campaign-code': campaign.code,
                  'first-name': schoolingRegistration.firstName,
                  'last-name': schoolingRegistration.lastName,
                  'birthdate': '1990-03-01',
                },
              },
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
          expect(response.result.errors[0].detail).to.equal('There are no schooling registrations found');
        });
      });

      context('when no schoolingRegistration found to associate because names does not match', () => {

        it('should return an 404 NotFoundError error', async () => {
          // given
          const options = {
            method: 'POST',
            url: '/api/schooling-registration-user-associations/',
            headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
            payload: {
              data: {
                attributes: {
                  'campaign-code': campaign.code,
                  'first-name': 'wrong firstName',
                  'last-name': 'wrong lastName',
                  'birthdate': schoolingRegistration.birthdate,
                },
              },
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
          expect(response.result.errors[0].detail).to.equal('There were no schoolingRegistrations matching with names');
        });
      });

      context('when user is not authenticated', () => {

        it('should respond with a 401 - unauthorized access', async () => {
          // given
          options.headers.authorization = 'invalid.access.token';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(401);
        });
      });

      context('when a field is not valid', () => {

        it('should respond with a 422 - Unprocessable Entity', async () => {
          // given
          const options = {
            method: 'POST',
            url: '/api/schooling-registration-user-associations/',
            headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
            payload: {
              data: {
                attributes: {
                  'campaign-code': campaign.code,
                  'first-name': ' ',
                  'last-name': schoolingRegistration.lastName,
                  'birthdate': schoolingRegistration.birthdate,
                },
              },
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(422);
        });
      });

      context('When withReconciliation query param is set to false', () => {

        it('should not reconcile user and return a 204 No Content', async () => {
          // given
          options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': schoolingRegistration.firstName,
              'last-name': schoolingRegistration.lastName,
              'birthdate': schoolingRegistration.birthdate,
            },
          };
          options.url += '?withReconciliation=false';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(204);
          const schoolingRegistrationInDB = await knex('schooling-registrations').where({
            firstName: schoolingRegistration.firstName,
            lastName: schoolingRegistration.lastName,
            birthdate: schoolingRegistration.birthdate,
          }).select();
          expect(schoolingRegistrationInDB.userId).to.be.undefined;
        });
      });
    });
  });

  describe('POST /api/schooling-registration-dependent-users/external-user-token/', () => {
    let organization;
    let campaign;
    let options;
    let schoolingRegistration;

    beforeEach(async () => {
      // given
      options = {
        method: 'POST',
        url: '/api/schooling-registration-dependent-users/external-user-token/',
        headers: {},
        payload: {},
      };

      organization = databaseBuilder.factory.buildOrganization({ identityProvider: 'SCO' });
      schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, userId: null });
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
      await databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('authentication-methods').delete();
    });

    context('when an external user try to reconcile for the first time', () => {

      it('should return an 200 status after having successfully created the user and associated it to schoolingRegistration', async () => {
        // given
        const externalUser = {
          lastName: schoolingRegistration.lastName,
          firstName: schoolingRegistration.firstName,
          samlId: '123456789',
        };
        const idTokenForExternalUser = generateIdTokenForExternalUser(externalUser);

        options.payload.data = {
          attributes: {
            'campaign-code': campaign.code,
            'external-user-token': idTokenForExternalUser,
            'birthdate': schoolingRegistration.birthdate,
            'access-token': null,
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });

      context('When external user is already reconciled', () => {

        it('should replace the existing user samlId already reconciled in the other organization with the authenticated user samlId', async () => {
          // given
          const user = databaseBuilder.factory.buildUser(
            {
              firstName: schoolingRegistration.firstName,
              lastName: schoolingRegistration.lastName,
              birthdate: schoolingRegistration.birthdate,
            });
          databaseBuilder.factory.buildAuthenticationMethod({ identityProvider: AuthenticationMethod.identityProviders.GAR, externalIdentifier: '12345678', userId: user.id });

          const otherOrganization = databaseBuilder.factory.buildOrganization({ type: 'SCO' });
          databaseBuilder.factory.buildSchoolingRegistration(
            {
              organizationId: otherOrganization.id,
              firstName: schoolingRegistration.firstName,
              lastName: schoolingRegistration.lastName,
              birthdate: schoolingRegistration.birthdate,
              nationalStudentId: schoolingRegistration.nationalStudentId,
              userId: user.id,
            });
          await databaseBuilder.commit();

          const externalUser = {
            lastName: schoolingRegistration.lastName,
            firstName: schoolingRegistration.firstName,
            samlId: '9876654321',
          };
          const idTokenForExternalUser = generateIdTokenForExternalUser(externalUser);

          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'external-user-token': idTokenForExternalUser,
              'birthdate': schoolingRegistration.birthdate,
              'access-token': null,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.payload).to.contains('access-token');
          const result = await knex('authentication-methods').where({ userId: user.id, identityProvider: AuthenticationMethod.identityProviders.GAR });
          const garAuthenticationMethod = result[0];
          expect(garAuthenticationMethod.externalIdentifier).to.equal(externalUser.samlId);
        });

        it('should replace the existing user samlId already reconciled in the same organization found with the authenticated user samlId', async () => {
          // given
          const userWithSamlIdOnly = databaseBuilder.factory.buildUser();
          databaseBuilder.factory.buildAuthenticationMethod({ identityProvider: AuthenticationMethod.identityProviders.GAR, externalIdentifier: '12345678', userId: userWithSamlIdOnly.id });

          const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration(
            {
              organizationId: organization.id,
              userId: userWithSamlIdOnly.id,
              firstName: userWithSamlIdOnly.firstName,
              lastName: userWithSamlIdOnly.lastName,
              birthdate: userWithSamlIdOnly.birthdate,
            });
          await databaseBuilder.commit();

          const externalUser = {
            lastName: schoolingRegistration.lastName,
            firstName: schoolingRegistration.firstName,
            samlId: '9876654321',
          };
          const idTokenForExternalUser = generateIdTokenForExternalUser(externalUser);

          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'external-user-token': idTokenForExternalUser,
              'birthdate': schoolingRegistration.birthdate,
              'access-token': null,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.payload).to.contains('access-token');
          const result = await knex('authentication-methods').where({ userId: userWithSamlIdOnly.id, identityProvider: AuthenticationMethod.identityProviders.GAR });
          const garAuthenticationMethod = result[0];
          expect(garAuthenticationMethod.externalIdentifier).to.equal(externalUser.samlId);
        });
      });

      context('when external user id token is not valid', () => {

        it('should respond with a 401 - unauthorized access', async () => {
          // given
          const invalidIdToken = 'invalid.id.token';

          options.payload.data = {
            attributes: {
              'campaign-code': campaign.code,
              'external-user-token': invalidIdToken,
              'birthdate': schoolingRegistration.birthdate,
              'access-token': null,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(401);
        });
      });

    });
  });

  describe('POST /api/schooling-registration-user-associations/auto', () => {
    const nationalStudentId = '12345678AZ';
    let organization;
    let campaign;
    let options;
    let user;

    beforeEach(async () => {
      // given
      options = {
        method: 'POST',
        url: '/api/schooling-registration-user-associations/auto',
        headers: {},
        payload: {},
      };

      user = databaseBuilder.factory.buildUser();
      organization = databaseBuilder.factory.buildOrganization();
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
      databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, userId: null, nationalStudentId });

      await databaseBuilder.commit();
    });

    it('should return an 200 status after having successfully associated user to schoolingRegistration', async () => {
      // given
      databaseBuilder.factory.buildSchoolingRegistration({ userId: user.id, nationalStudentId });
      await databaseBuilder.commit();

      options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
      options.payload.data = {
        attributes: {
          'campaign-code': campaign.code,
        },
        type: 'schooling-registration-user-associations',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

    context('when user is not authenticated', () => {

      it('should respond with a 401 - unauthorized access', async () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('when user could not be reconciled', () => {

      it('should respond with a 422 - unprocessable entity', async () => {
        // given
        options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
        options.payload.data = {
          attributes: {
            'campaign-code': campaign.code,
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });
  });

  describe('POST /api/schooling-registration-user-associations/register', () => {
    let organization;
    let campaign;
    let options;
    let user;

    beforeEach(async () => {
      // given
      options = {
        method: 'POST',
        url: '/api/schooling-registration-user-associations/register',
        headers: {},
        payload: {},
      };

      user = databaseBuilder.factory.buildUser();
      organization = databaseBuilder.factory.buildOrganization();
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });

      await databaseBuilder.commit();
    });

    afterEach(() => {
      return knex('schooling-registrations').delete();
    });

    it('should return an 204 status after creating higher schooling registration', async () => {
      // given
      options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
      options.payload.data = {
        attributes: {
          'student-number': '12345',
          'first-name': 'Jean',
          'last-name': 'Michel',
          'birthdate': '2010-01-01',
          'campaign-code': campaign.code,
        },
        type: 'schooling-registration-user-associations',
      };

      // when
      const response = await server.inject(options);
      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('GET /api/schooling-registration-user-associations/', () => {
    let options;
    let server;
    let user;
    let organization;
    let schoolingRegistration;
    let campaignCode;

    beforeEach(async () => {
      server = await createServer();

      organization = databaseBuilder.factory.buildOrganization({ isManagingStudents: true });
      campaignCode = databaseBuilder.factory.buildCampaign({ organizationId: organization.id }).code;
      user = databaseBuilder.factory.buildUser();
      schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, userId: user.id });
      await databaseBuilder.commit();
      options = {
        method: 'GET',
        url: `/api/schooling-registration-user-associations/?userId=${user.id}&campaignCode=${campaignCode}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };
    });

    describe('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', async () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if requested user is not the same as authenticated user', async () => {
        // given
        const otherUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(otherUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Success case', () => {

      it('should return the schoolingRegistration linked to the user and a 200 status code response', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.attributes['first-name']).to.deep.equal(schoolingRegistration.firstName);
        expect(response.result.data.attributes['last-name']).to.deep.equal(schoolingRegistration.lastName);
        expect(response.result.data.attributes['birthdate']).to.deep.equal(schoolingRegistration.birthdate);
      });
    });

    describe('There is no schoolingRegistration linked to the user', () => {

      it('should return a data null', async () => {
        // given
        const userWithoutStudent = databaseBuilder.factory.buildUser();
        await databaseBuilder.commit();

        options = {
          method: 'GET',
          url: `/api/schooling-registration-user-associations/?userId=${userWithoutStudent.id}&campaignCode=${campaignCode}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userWithoutStudent.id) },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.data).to.equal(null);
      });
    });

    describe('There is no schoolingRegistration linked to the organization owning the campaign', () => {

      it('should return a data null', async () => {
        // given
        const otherCampaignCode = databaseBuilder.factory.buildCampaign().code;
        await databaseBuilder.commit();
        options = {
          method: 'GET',
          url: `/api/schooling-registration-user-associations/?userId=${user.id}&campaignCode=${otherCampaignCode}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.data).to.equal(null);
      });
    });
  });

  describe('PUT /api/schooling-registration-user-associations/possibilities', () => {
    let options;
    let server;
    let user;
    let organization;
    let schoolingRegistration;
    let campaignCode;

    beforeEach(async () => {
      server = await createServer();

      organization = databaseBuilder.factory.buildOrganization({ isManagingStudents: true });
      campaignCode = databaseBuilder.factory.buildCampaign({ organizationId: organization.id }).code;
      user = databaseBuilder.factory.buildUser();
      schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, firstName: user.firstName, lastName: user.lastName, userId: null });
      await databaseBuilder.commit();
      options = {
        method: 'PUT',
        url: '/api/schooling-registration-user-associations/possibilities',
        headers: {},
        payload: {
          data: {
            attributes: {
              'campaign-code': campaignCode,
              'first-name': schoolingRegistration.firstName,
              'last-name': schoolingRegistration.lastName,
              birthdate: schoolingRegistration.birthdate,
            },
          },
        },
      };
    });

    describe('Success case', () => {

      it('should return the schoolingRegistration linked to the user and a 200 status code response', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    describe('Error cases', () => {

      context('when no schoolingRegistration can be associated because birthdate does not match', () => {

        it('should respond with a 404 - Not Found', async () => {
          // given
          options.payload.data.attributes.birthdate = '1990-03-01';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
          expect(response.result.errors[0].detail).to.equal('There were no schoolingRegistrations matching with organization and birthdate');
        });
      });

      context('when no schoolingRegistration found to associate because names does not match', () => {

        it('should respond with a 404 - Not Found', async () => {
          // given
          options.payload.data.attributes['first-name'] = 'wrong firstName';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
          expect(response.result.errors[0].detail).to.equal('There were no schoolingRegistrations matching with names');
        });
      });

      context('when schoolingRegistration is already associated in the same organization', () => {

        it('should return a schooling registration already linked error (short code S51 when account with email)', async () => {
          // given
          const userWithEmailOnly = databaseBuilder.factory.buildUser({
            username: null,
            email: 'john.harry@example.net',
          });
          const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, userId: userWithEmailOnly.id });
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta: { shortCode: 'S51', value: 'j***@example.net' },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithEmailOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaignCode,
              'first-name': schoolingRegistration.firstName,
              'last-name': schoolingRegistration.lastName,
              'birthdate': schoolingRegistration.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });

        it('should return a schooling registration already linked error (short code S52 when connected with username)', async () => {
          // given
          const userWithUsernameOnly = databaseBuilder.factory.buildUser({
            username: 'john.harry0702',
            email: null,
          });
          const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, userId: userWithUsernameOnly.id });
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta: { shortCode: 'S52', value: 'j***.h***2' },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithUsernameOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaignCode,
              'first-name': schoolingRegistration.firstName,
              'last-name': schoolingRegistration.lastName,
              'birthdate': schoolingRegistration.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });

        it('should return a schooling registration already linked error (short code S53 when account with samlId)', async () => {
          // given
          const userWithEmailOnly = databaseBuilder.factory.buildUser({
            username: null,
            email: null,
          });
          databaseBuilder.factory.buildAuthenticationMethod({ identityProvider: AuthenticationMethod.identityProviders.GAR, externalIdentifier: '12345678', userId: userWithEmailOnly.id });

          const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, userId: null });
          schoolingRegistration.userId = userWithEmailOnly.id;
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta: { shortCode: 'S53', value: null },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithEmailOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaignCode,
              'first-name': schoolingRegistration.firstName,
              'last-name': schoolingRegistration.lastName,
              'birthdate': schoolingRegistration.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });

      });

      context('when schoolingRegistration is already associated in others organizations', () => {

        it('should respond with a 409 - Conflict', async () => {
          // given
          const schoolingRegistrationAlreadyMatched = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, firstName: user.firstName, lastName: user.lastName, userId: user.id });
          await databaseBuilder.commit();
          options.payload.data.attributes['first-name'] = schoolingRegistrationAlreadyMatched.firstName;
          options.payload.data.attributes['last-name'] = schoolingRegistrationAlreadyMatched.lastName;
          options.payload.data.attributes.birthdate = schoolingRegistrationAlreadyMatched.birthdate;

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0].detail).to.equal('Un compte existe déjà pour l‘élève dans le même établissement.');
        });

        it('should return a schooling registration already linked error (short code S61 when account with email)', async () => {
          // given
          const userWithEmailOnly = databaseBuilder.factory.buildUser({
            username: null,
            email: 'john.harry@example.net',
          });
          databaseBuilder.factory.buildSchoolingRegistration({
            nationalStudentId: schoolingRegistration.nationalStudentId,
            birthdate: schoolingRegistration.birthdate,
            firstName: schoolingRegistration.firstName,
            lastName: schoolingRegistration.lastName,
            userId: userWithEmailOnly.id,
          });
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta: { shortCode: 'S61', value: 'j***@example.net' },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithEmailOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaignCode,
              'first-name': schoolingRegistration.firstName,
              'last-name': schoolingRegistration.lastName,
              'birthdate': schoolingRegistration.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });

        it('should return a schooling registration already linked error (short code S62 when connected with username)', async () => {
          // given
          const userWithUsernameOnly = databaseBuilder.factory.buildUser({
            username: 'john.harry0702',
            email: null,
          });
          databaseBuilder.factory.buildSchoolingRegistration({
            nationalStudentId: schoolingRegistration.nationalStudentId,
            birthdate: schoolingRegistration.birthdate,
            firstName: schoolingRegistration.firstName,
            lastName: schoolingRegistration.lastName,
            userId: userWithUsernameOnly.id,
          });
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta: { shortCode: 'S62', value: 'j***.h***2' },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithUsernameOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaignCode,
              'first-name': schoolingRegistration.firstName,
              'last-name': schoolingRegistration.lastName,
              'birthdate': schoolingRegistration.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });

        it('should return a schooling registration already linked error (short code S63 when account with samlId)', async () => {
          // given
          const userWithSamlIdOnly = databaseBuilder.factory.buildUser({
            email: null,
            username: null,
          });
          databaseBuilder.factory.buildAuthenticationMethod({ identityProvider: AuthenticationMethod.identityProviders.GAR, externalIdentifier: '12345678', userId: userWithSamlIdOnly.id });

          databaseBuilder.factory.buildSchoolingRegistration({
            nationalStudentId: schoolingRegistration.nationalStudentId,
            birthdate: schoolingRegistration.birthdate,
            firstName: schoolingRegistration.firstName,
            lastName: schoolingRegistration.lastName,
            userId: userWithSamlIdOnly.id,
          });
          await databaseBuilder.commit();

          const expectedResponse = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta: { shortCode: 'S63', value: null },
          };

          options.headers.authorization = generateValidRequestAuthorizationHeader(userWithSamlIdOnly.id);
          options.payload.data = {
            attributes: {
              'campaign-code': campaignCode,
              'first-name': schoolingRegistration.firstName,
              'last-name': schoolingRegistration.lastName,
              'birthdate': schoolingRegistration.birthdate,
            },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
          expect(response.result.errors[0]).to.deep.equal(expectedResponse);
        });

      });

      context('when a field is not valid', () => {

        it('should respond with a 422 - Unprocessable Entity', async () => {
          // given
          options.payload.data.attributes['last-name'] = ' ';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(422);
        });
      });
    });
  });

  describe('DELETE /api/schooling-registration-user-associations/', () => {
    it('should return an 204 status after having successfully dissociated user from schoolingRegistration', async () => {
      const organization = databaseBuilder.factory.buildOrganization();
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId: user.id, organizationRole: Membership.roles.ADMIN });
      const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id });

      const authorizationToken = generateValidRequestAuthorizationHeader(user.id);

      await databaseBuilder.commit();

      const options = {
        method: 'DELETE',
        url: '/api/schooling-registration-user-associations/',
        headers: {
          authorization: authorizationToken,
        },
        payload: {
          data: {
            attributes: {
              'schooling-registration-id': schoolingRegistration.id,
            },
          },
        },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(204);
    });

    it('should return an 403 status when user is not admin of the organization', async () => {
      const organization = databaseBuilder.factory.buildOrganization();
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId: user.id, organizationRole: Membership.roles.MEMBER });
      const schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id });

      const authorizationToken = generateValidRequestAuthorizationHeader(user.id);

      await databaseBuilder.commit();

      const options = {
        method: 'DELETE',
        url: '/api/schooling-registration-user-associations/',
        headers: {
          authorization: authorizationToken,
        },
        payload: {
          data: {
            attributes: {
              'schooling-registration-id': schoolingRegistration.id,
            },
          },
        },
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(403);
    });
  });

  describe('PATCH /api/organizations/organizationId/schooling-registration-user-associations/schoolingRegistrationId', () => {
    let organizationId;
    const studentNumber = '54321';
    let schoolingRegistrationId;
    let authorizationToken;

    beforeEach(async () => {
      organizationId = databaseBuilder.factory.buildOrganization({ isManagingStudents: true, type: 'SUP' }).id;

      const user = databaseBuilder.factory.buildUser();
      authorizationToken = generateValidRequestAuthorizationHeader(user.id);
      schoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({ organizationId }).id;
      databaseBuilder.factory.buildMembership({ organizationId, userId: user.id, organizationRole: Membership.roles.ADMIN });
      await databaseBuilder.commit();
    });

    context('Success cases', () => {

      it('should return an HTTP response with status code 204', async () => {
        const options = {
          method: 'PATCH',
          url: `/api/organizations/${organizationId}/schooling-registration-user-associations/${schoolingRegistrationId}`,
          headers: {
            authorization: authorizationToken,
          },
          payload: {
            data: {
              attributes: {
                'student-number': studentNumber,
              },
            },
          },
        };
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(204);
      });

    });
  });
});
