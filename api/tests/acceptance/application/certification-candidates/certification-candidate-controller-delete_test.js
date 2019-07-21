const { expect, databaseBuilder, generateValidRequestAuhorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | certification-candidate-controller-delete', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  afterEach(() => databaseBuilder.clean());

  describe('DELETE /certification-candidates/{id}', () => {
    let certificationCandidate, unsafeCertificationCandidate, userId, forbiddenUserId;

    beforeEach(async () => {
      // given
      userId = databaseBuilder.factory.buildUser().id;
      forbiddenUserId = databaseBuilder.factory.buildUser().id;
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const forbiddenCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
      databaseBuilder.factory.buildCertificationCenterMembership({ userId: forbiddenUserId, certificationCenterId: forbiddenCertificationCenterId });
      const sessionId = databaseBuilder.factory.buildSession({ date: new Date('2000-01-01'), certificationCenterId }).id;
      const forbiddenSessionId = databaseBuilder.factory.buildSession({ certificationCenterId: forbiddenCertificationCenterId }).id;
      const unsafeSessionId = databaseBuilder.factory.buildSession({ date: new Date(), certificationCenterId }).id;
      certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({ sessionId });
      databaseBuilder.factory.buildCertificationCandidate({ sessionId: forbiddenSessionId });
      unsafeCertificationCandidate = databaseBuilder.factory.buildCertificationCandidate({ sessionId: unsafeSessionId });

      await databaseBuilder.commit();
    });

    afterEach(() => databaseBuilder.clean());

    context('user does not have authorization token', () => {

      it('should return 401 HTTP status code when user is not authorized', async () => {
        // when
        try {
          await server.inject({
            method: 'DELETE',
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
            method: 'DELETE',
            url: `/api/certification-candidates/${certificationCandidate.id}`,
            payload: {},
            headers: { authorization: generateValidRequestAuhorizationHeader(forbiddenUserId) },
          });
        } catch (response) {
          // then
          expect(response.statusCode).to.equal(401);
        }
      });

      context('user has the required certif center membership to access this candidate', () => {

        it('should return 401 HTTP status code when certification candidate is not safe to delete', async () => {
          // when
          try {
            await server.inject({
              method: 'DELETE',
              url: `/api/certification-candidates/${unsafeCertificationCandidate.id}`,
              payload: {},
              headers: { authorization: generateValidRequestAuhorizationHeader(userId) },
            });
          } catch (response) {
            // then
            expect(response.statusCode).to.equal(401);
          }
        });

        context('certification candidate is safe to delete', () => {

          it('should return 200 HTTP status code', async () => {
            // when
            const response = await server.inject({
              method: 'DELETE',
              url: `/api/certification-candidates/${certificationCandidate.id}`,
              payload: {},
              headers: { authorization: generateValidRequestAuhorizationHeader(userId) },
            });

            // then
            expect(response.statusCode).to.equal(200);
          });

          it('should return the deleted certification candidate information with all attributes to undefined or default value', async () => {
            // when
            const response = await server.inject({
              method: 'DELETE',
              url: `/api/certification-candidates/${certificationCandidate.id}`,
              payload: {},
              headers: { authorization: generateValidRequestAuhorizationHeader(userId) },
            });

            // then
            expect(response.result.data.attributes['first-name']).to.equal(undefined);
            expect(response.result.data.attributes['last-name']).to.equal(undefined);
          });

        });

      });

    });

  });

});
