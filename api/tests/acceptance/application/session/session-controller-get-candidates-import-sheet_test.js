
const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | session-controller-get-candidates-import-sheet', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /api/sessions/{id}/candidates-import-sheet', () => {
    let user, sessionIdAllowed, sessionIdNotAllowed;
    beforeEach(async () => {
      // given
      user = databaseBuilder.factory.buildUser();
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId: user.id, certificationCenterId });

      const otherUserId = databaseBuilder.factory.buildUser().id;
      const otherCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId: otherUserId, certificationCenterId: otherCertificationCenterId });

      sessionIdAllowed = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
      sessionIdNotAllowed = databaseBuilder.factory.buildSession({ certificationCenterId: otherCertificationCenterId }).id;

      await databaseBuilder.commit();
    });

    it('should respond with a 200 when session can be found', async () => {
      // when
      const authHeader = generateValidRequestAuthorizationHeader(user.id);
      const token = authHeader.replace('Bearer ', '');
      const options = {
        method: 'GET',
        url: `/api/sessions/${sessionIdAllowed}/candidates-import-sheet?accessToken=${token}`,
        payload: {},
      };
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });

    it('should respond with a 403 when user cant access the session', async () => {
      // when
      const authHeader = generateValidRequestAuthorizationHeader(user.id);
      const token = authHeader.replace('Bearer ', '');
      const options = {
        method: 'GET',
        url: `/api/sessions/${sessionIdNotAllowed}/candidates-import-sheet?accessToken=${token}`,
        payload: {},
      };
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(403);
      });
    });
  });

});
