const { expect, databaseBuilder, generateValidRequestAuthorizationHeader, insertUserWithRolePixMaster } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | session-controller-generate-session-results-download-link', () => {

  let server;

  const sessionId = 121;
  const options = {
    method: 'GET',
    url: `/api/admin/sessions/${sessionId}/generate-results-download-link`,
    payload: { },
  };

  beforeEach(async () => {
    server = await createServer();
    await insertUserWithRolePixMaster();
  });

  describe('GET /api/admin/sessions/{id}/generate-results-download-link', () => {
    context('when user is Pix Master', () => {
      it('should return a 200 status code response', async () => {
        databaseBuilder.factory.buildSession({ id: sessionId });
        await databaseBuilder.commit();

        // when
        options.headers = { authorization: generateValidRequestAuthorizationHeader() };
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('when user is not PixMaster', () => {
      it('should return 403 HTTP status code', async () => {
        // when
        options.headers = { authorization: generateValidRequestAuthorizationHeader(1111) };
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user is not connected', () => {
      it('should return 401 HTTP status code if user is not authenticated', async () => {
        // when
        options.headers = {};
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
