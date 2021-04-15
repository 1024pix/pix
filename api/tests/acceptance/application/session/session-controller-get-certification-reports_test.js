const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
// eslint-disable-next-line no-restricted-modules
const createServer = require('../../../../server');

describe('Acceptance | Controller | session-controller-get-certification-reports', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /sessions/{id}/certification-reports', function() {
    let sessionId;
    let userId;
    let certificationCenterId;

    beforeEach(() => {
      ({ id: sessionId, certificationCenterId } = databaseBuilder.factory.buildSession());

      return databaseBuilder.commit();
    });

    context('when user has no access to session resources', () => {

      beforeEach(() => {
        userId = databaseBuilder.factory.buildUser().id;
        return databaseBuilder.commit();
      });

      it('should return 404 HTTP status code (to keep opacity on whether forbidden or not found)', async () => {
        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/sessions/${sessionId}/certification-reports`,
          payload: {},
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(response.statusCode).to.equal(404);
      });

    });

    context('when user has access to session resources', () => {

      it('should return 200 HTTP status code', async () => {
        // given
        userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/sessions/${sessionId}/certification-reports`,
          payload: {},
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(response.statusCode).to.equal(200);
      });

    });

  });

});
