const { expect, databaseBuilder, generateValidRequestAuhorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | certification-candidate-controller-get', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /certification-candidates/{id}', () => {
    let certificationCandidate, userId, forbiddenUserId;

    beforeEach(async () => {
      // given
      userId = databaseBuilder.factory.buildUser().id;
      forbiddenUserId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const forbiddenCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      databaseBuilder.factory.buildCertificationCenterMembership({ userId: forbiddenUserId, certificationCenterId: forbiddenCertificationCenterId });
      const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
      const forbiddenSessionId = databaseBuilder.factory.buildSession({ certificationCenterId: forbiddenCertificationCenterId }).id;
      certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({ sessionId });
      databaseBuilder.factory.buildCertificationCandidate({ sessionId: forbiddenSessionId });

      await databaseBuilder.commit();
    });

    afterEach(() => databaseBuilder.clean());

    context('user does not have authorization token', () => {

      it('should return 401 HTTP status code when user is not authorized', async () => {
        // when
        try {
          await server.inject({
            method: 'GET',
            url: `/api/certification-candidates/${certificationCandidate.id}`,
            payload: {},
          });
        } catch (response) {
          // then
          expect(response.statusCode).to.equal(401);
        }
      });
    });

    context('user has authorization token', () => {

      it('should return 401 HTTP status code when user does not have the required certif center membership to access this candidate', async () => {
        // when
        try {
          await server.inject({
            method: 'GET',
            url: `/api/certification-candidates/${certificationCandidate.id}`,
            payload: {},
            headers: { authorization: generateValidRequestAuhorizationHeader(forbiddenUserId) },
          });
        } catch (response) {
          // then
          expect(response.statusCode).to.equal(401);
        }
      });

      it('should return 404 HTTP status code when certification candidate does not exist', async () => {
        // when
        try {
          await server.inject({
            method: 'GET',
            url: '/api/certification-candidates/' + (certificationCandidate.id + 1).toString(),
            payload: {},
            headers: { authorization: generateValidRequestAuhorizationHeader(userId) },
          });
        } catch (response) {
          // then
          expect(response.statusCode).to.equal(404);
        }
      });

      context('certification candidate exists and user has the authorization to access its information', () => {

        it('should return 200 HTTP status code', async () => {
          // when
          const response = await server.inject({
            method: 'GET',
            url: `/api/certification-candidates/${certificationCandidate.id}`,
            payload: {},
            headers: { authorization: generateValidRequestAuhorizationHeader(userId) },
          });

          // then
          expect(response.statusCode).to.equal(200);
        });

        it('should return certification candidate information ', async () => {
          // when
          const response = await server.inject({
            method: 'GET',
            url: `/api/certification-candidates/${certificationCandidate.id}`,
            payload: {},
            headers: { authorization: generateValidRequestAuhorizationHeader(userId) },
          });

          // then
          expect(response.result.data.attributes['first-name']).to.equal(certificationCandidate.firstName);
        });

      });

    });

  });

});
