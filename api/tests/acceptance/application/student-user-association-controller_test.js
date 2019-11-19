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

    it('should return an 404 NotFoundError error if we don’t find a student to associate', async () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/student-user-associations',
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        payload: {
          data: {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': 'wrong fristName',
              'last-name': 'wrong lastName',
              'birthdate': '1990-03-01'
            }
          }
        }
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
      expect(response.result.errors[0].detail).to.equal('Not found only 1 student');
    });

    it('should return an 403 UserNotAuthorizedToAccessEntity error if user is not connected', async () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/student-user-associations',
        headers: { authorization: generateValidRequestAuthorizationHeader(null) },
        payload: {
          data: {
            attributes: {
              'campaign-code': campaign.code,
              'first-name': student.firstName,
              'last-name': student.lastName,
              'birthdate': student.birthdate
            }
          }
        }
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.result.errors[0].detail).to.equal('Utilisateur non autorisé à accéder à la ressource');
    });
  });
});
