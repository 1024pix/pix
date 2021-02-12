const {
  expect, generateValidRequestAuthorizationHeader, databaseBuilder, insertUserWithRolePixMaster,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | finalized-session-controller-publish', () => {
  let server;

  beforeEach(async () => {
    server = await createServer();
    await insertUserWithRolePixMaster();
  });

  describe('POST /api/admin/publishable-sessions/{sessionId}/publish', () => {

    it('should return a 200 status code response with JSON API serialized', async () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/admin/publishable-sessions/121/publish',
        payload: { },
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      };
      databaseBuilder.factory.buildSession({ id: 121 });
      databaseBuilder.factory.buildCertificationCourse({ sessionId: 121, isPublished: false });
      databaseBuilder.factory.buildFinalizedSession({ sessionId: 121, isPublishable: true, publishedAt: null });
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
