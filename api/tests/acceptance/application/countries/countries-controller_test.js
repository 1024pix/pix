import { expect, generateValidRequestAuthorizationHeader } from '../../../test-helper';
import createServer from '../../../../server';

describe('Acceptance | API | countries-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/countries/', function () {
    it('should return 200 HTTP status code', async function () {
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
