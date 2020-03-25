const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | Student-user-associations', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/student-user-associations', () => {
    let organization;
    let campaign;
    let options;
    let schoolingRegistration;
    let user;

    beforeEach(async () => {
      // given
      options = {
        method: 'POST',
        url: '/api/student-user-associations',
        headers: {},
        payload: {}
      };

      user = databaseBuilder.factory.buildUser();
      organization = databaseBuilder.factory.buildOrganization();
      schoolingRegistration = databaseBuilder.factory.buildSchoolingRegistration({ organizationId: organization.id, userId: null });
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });

      await databaseBuilder.commit();
    });

    it('should return an 204 status after having successfully associated user to schoolingRegistration', async () => {
      // given
      options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
      options.payload.data = {
        attributes: {
          'campaign-code': campaign.code,
          'first-name': schoolingRegistration.firstName,
          'last-name': schoolingRegistration.lastName,
          'birthdate': schoolingRegistration.birthdate
        }
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    context('when no schoolingRegistration found to associate because birthdate does not match', () => {

      it('should return an 404 NotFoundError error', async () => {
        // given
        const options = {
          method: 'POST',
          url: '/api/student-user-associations',
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          payload: {
            data: {
              attributes: {
                'campaign-code': campaign.code,
                'first-name': schoolingRegistration.firstName,
                'last-name': schoolingRegistration.lastName,
                'birthdate': '1990-03-01'
              }
            }
          }
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
        expect(response.result.errors[0].detail).to.equal('There were no schoolingRegistrations matching with organization and birthdate');
      });
    });

    context('when no schoolingRegistration found to associate because names does not match', () => {

      it('should return an 404 NotFoundError error', async () => {
        // given
        const options = {
          method: 'POST',
          url: '/api/student-user-associations',
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          payload: {
            data: {
              attributes: {
                'campaign-code': campaign.code,
                'first-name': 'wrong firstName',
                'last-name': 'wrong lastName',
                'birthdate': schoolingRegistration.birthdate
              }
            }
          }
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
          url: '/api/student-user-associations',
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          payload: {
            data: {
              attributes: {
                'campaign-code': campaign.code,
                'first-name': ' ',
                'last-name': schoolingRegistration.lastName,
                'birthdate': schoolingRegistration.birthdate
              }
            }
          }
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });
  });

  describe('GET /api/student-user-associations', () => {
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
        url: `/api/student-user-associations?userId=${user.id}&campaignCode=${campaignCode}`,
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
          url: `/api/student-user-associations?userId=${userWithoutStudent.id}&campaignCode=${campaignCode}`,
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
          url: `/api/student-user-associations?userId=${user.id}&campaignCode=${otherCampaignCode}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.result.data).to.equal(null);
      });
    });
  });

  describe('PUT /api/student-user-associations/possibilities', () => {
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
        url: '/api/student-user-associations/possibilities',
        headers: {},
        payload: {
          data: {
            attributes: {
              'campaign-code': campaignCode,
              'first-name': schoolingRegistration.firstName,
              'last-name': schoolingRegistration.lastName,
              birthdate: schoolingRegistration.birthdate
            }
          }
        }
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

      context('when no schoolingRegistration found to associate because birthdate does not match', () => {

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
          expect(response.result.errors[0].detail).to.equal('L\'élève est déjà rattaché à un compte utilisateur.');
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
});
