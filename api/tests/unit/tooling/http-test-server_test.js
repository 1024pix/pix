const { expect, generateValidRequestAuthorizationHeader } = require('../../test-helper');

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

      it('should answer unauthorized if no authentication is provided', async () => {

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

      it('should answer unauthorized if authentication is invalid', async () => {

        // given
        const request = {
          method: 'GET',
          url: '/foo',
          headers: { authorization: 'invalidToken' },
        };

        // when
        const response = await httpTestServerWithAuthentication.request(request.method, request.url, null, null, request.headers);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should answer internal error if authentication is valid, as actual strategy is not implemented (use actual server instead)', async () => {
        // given
        const request = {
          method: 'GET',
          url: '/foo',
          headers: { authorization: generateValidRequestAuthorizationHeader() },
        };

        // when
        const response = await httpTestServerWithAuthentication.request(request.method, request.url, null, null, request.headers);

        // then
        expect(response.statusCode).to.equal(500);
      });
    });
  });
});
