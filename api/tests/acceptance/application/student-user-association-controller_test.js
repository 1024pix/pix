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
    let student;
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
      student = databaseBuilder.factory.buildStudent({ organizationId: organization.id, userId: null });
      campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });

      await databaseBuilder.commit();
    });

    it('should return an 204 status after having successfully associated user to student', async () => {
      // given
      options.headers.authorization = generateValidRequestAuthorizationHeader(user.id);
      options.payload.data = {
        attributes: {
          'campaign-code': campaign.code,
          'first-name': student.firstName,
          'last-name': student.lastName,
          'birthdate': student.birthdate
        }
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    context('when no student found to associate because birthdate does not match', () => {

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
                'first-name': student.firstName,
                'last-name': student.lastName,
                'birthdate': '1990-03-01'
              }
            }
          }
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
        expect(response.result.errors[0].detail).to.equal('There were no students matching');
      });
    });

    context('when no student found to associate because names does not match', () => {

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
                'birthdate': student.birthdate
              }
            }
          }
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
        expect(response.result.errors[0].detail).to.equal('There were not exactly one student match for this user and organization');
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
                'last-name': student.lastName,
                'birthdate': student.birthdate
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
    let student;
    let campaignCode;

    beforeEach(async () => {
      server = await createServer();

      organization = databaseBuilder.factory.buildOrganization({ isManagingStudents: true });
      campaignCode = databaseBuilder.factory.buildCampaign({ organizationId: organization.id }).code;
      user = databaseBuilder.factory.buildUser();
      student = databaseBuilder.factory.buildStudent({ organizationId: organization.id, userId: user.id });
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

      it('should return the student linked to the user and a 200 status code response', async () => {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.attributes['first-name']).to.deep.equal(student.firstName);
        expect(response.result.data.attributes['last-name']).to.deep.equal(student.lastName);
        expect(response.result.data.attributes['birthdate']).to.deep.equal(student.birthdate);
      });
    });

    describe('There is no student linked to the user', () => {

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

    describe('There is no student linked to the organization owning the campaign', () => {

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
});
