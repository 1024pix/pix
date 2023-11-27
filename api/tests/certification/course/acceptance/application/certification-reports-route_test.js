import { expect, databaseBuilder, generateValidRequestAuthorizationHeader } from '../../../../test-helper.js';
import { createServer } from '../../../../../server.js';

describe('Acceptance | Route | Course | certification-reports-route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /sessions/{id}/certification-reports', function () {
    let sessionId;
    let userId;
    let certificationCenterId;

    beforeEach(function () {
      ({ id: sessionId, certificationCenterId } = databaseBuilder.factory.buildSession());

      return databaseBuilder.commit();
    });

    context('when user has no access to session resources', function () {
      beforeEach(function () {
        userId = databaseBuilder.factory.buildUser().id;
        return databaseBuilder.commit();
      });

      it('should return 404 HTTP status code (to keep opacity on whether forbidden or not found)', async function () {
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

    context('when user has access to session resources', function () {
      it('should return 200 HTTP status code', async function () {
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
