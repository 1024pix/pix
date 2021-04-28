const { expect } = require('../../test-helper');

const HttpTestServer = require('../../tooling/server/http-test-server');

describe('Unit | Tooling | Http-test-server', () => {

  describe('#constructor', () => {
    let server;

    before(() => {
      server = new HttpTestServer();
    });

    it('should create hapi server', () => {
      // then
      expect(server.hapiServer).to.exist;
    });

    it('Should use pre-response-utils function', () => {
      // then
      expect(server.hapiServer._core.extensions.route.onPreResponse.nodes[0].func.name).to.equal('handleDomainAndHttpErrors');
    });
  });

  describe('#register', () => {

    it('should throw error if route is invalid', async () => {

      const invalidRoute = {
        name: 'foo-route',
        register: async function(server) {
          server.route([{
            method: 'GET',
          }]);
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

