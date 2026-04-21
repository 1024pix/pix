import { server } from '../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Acceptance | API | countries-controller', function () {
  describe('GET /api/countries/', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const options = {
        method: 'GET',
        url: '/api/countries',
        headers: generateAuthenticatedUserRequestHeaders({ userId: 12345 }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
