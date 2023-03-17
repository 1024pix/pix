import SmartFuzz from '../../tooling/smart-fuzz.js';
import { expect } from '../../test-helper.js';
import createServer from '../../../server.js';

const server = await createServer();
const routes = server.table();

describe('Acceptance | Fuzz', function () {
  routes.forEach(function (route) {
    it(`${route.method} ${route.path} should pass fuzzing`, async function () {
      const { url, payload, headers } = SmartFuzz(route);
      const testResponse = await server.inject({
        payload,
        headers: Object.assign({}, headers),
        method: route.method,
        url,
      });

      const { statusCode } = testResponse;

      expect(statusCode).to.be.below(500);
    });
  });
});
