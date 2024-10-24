import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../../test-helper.js';

describe('Certification | Session Management | Acceptance | Application | Controller | unfinalize', function () {
  describe('PATCH /api/admin/sessions/{sessionId}/unfinalize', function () {
    it('should return status 204', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser.withRole().id;
      databaseBuilder.factory.buildSession({ id: 123 });
      databaseBuilder.factory.buildFinalizedSession({ sessionId: 123 });
      await databaseBuilder.commit();

      const server = await createServer();
      const options = {
        method: 'PATCH',
        url: '/api/admin/sessions/123/unfinalize',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
      };

      // when
      const response = await server.inject(options);
      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
