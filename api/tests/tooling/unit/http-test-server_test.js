import { expect } from '../../test-helper.js';
import { HttpTestServer } from '../../tooling/server/http-test-server.js';

describe('Unit | Tooling | Http-test-server', function () {
  describe('#constructor', function () {
    let server;

    before(function () {
      server = new HttpTestServer();
    });

    it('should create hapi server', function () {
      // then
      expect(server.hapiServer).to.exist;
    });
  });

  describe('#register', function () {
    it('should throw error if route is invalid', async function () {
      const invalidRoute = {
        name: 'foo-route',
        register: async function (server) {
          server.route([
            {
              method: 'GET',
            },
          ]);
        },
      };

      const server = new HttpTestServer();

      let registerError;
      try {
        await server.register(invalidRoute);
      } catch (error) {
        registerError = error;
      }

      expect(registerError.message).to.contain('Invalid route options (GET )');
    });
  });
});
