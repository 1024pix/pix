const { expect, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | API | countries-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /api/countries/', () => {

    it('should return 200 HTTP status code', async () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/countries',
        headers: {
          authorization: generateValidRequestAuthorizationHeader({ userId: 12345 }),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
