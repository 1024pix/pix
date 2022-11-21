const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | session-controller-post-import-sessions', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/sessions/import', function () {
    context('when user imports sessions', function () {
      it('should return status 201', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/sessions/import',
          payload: {},
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        });

        // then
        expect(response.statusCode).to.equal(201);
      });
    });
  });
});
