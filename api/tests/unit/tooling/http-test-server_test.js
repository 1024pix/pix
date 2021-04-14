const { expect } = require('../../test-helper');

const HttpTestServer = require('../../tooling/server/http-test-server');

describe('Unit | Tooling | Http-test-server', () => {

  describe('#constructor', () => {
    let httpTestServer;

    before(() => {
      httpTestServer = new HttpTestServer([]);
    });

    it('should create hapi server', () => {
      // then
      expect(httpTestServer.hapiServer).to.exist;
    });

    it('Should use pre-response-utils function', () => {
      // then
      expect(httpTestServer.hapiServer._core.extensions.route.onPreResponse.nodes[0].func.name).to.equal('handleDomainAndHttpErrors');
    });

    describe('when authentication is enabled', async () => {

      let httpTestServerWithAuthentication;

      before(() => {
        const moduleUnderTest = {
          name: 'foo-route',
          register: async function(server) {
            server.route([{
              method: 'GET',
              path: '/foo',
              config: {
                handler: () => {
                  return 'bar';
                },
              },
            }]);
          },
        };
        httpTestServerWithAuthentication = new HttpTestServer(moduleUnderTest, true);
      });

      it('should reject if no authentication is provided', async () => {

        // given
        const request = {
          method: 'GET',
          url: '/foo',
        };

        // when
        const response = await httpTestServerWithAuthentication.request(request.method, request.url, null, null);

        // then
        expect(response.statusCode).to.equal(401);
      });

    });
  });
});
