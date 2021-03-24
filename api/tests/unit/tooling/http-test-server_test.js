const { expect } = require('../../test-helper');

const HttpTestServer = require('../../tooling/server/http-test-server');

describe('Unit | Tooling | Http-test-server', function() {

  describe('#constructor', function() {
    let httpTestServer;

    before(function() {
      httpTestServer = new HttpTestServer([]);
    });

    it('should create hapi server', function() {
      // then
      expect(httpTestServer.hapiServer).to.exist;
    });

    it('Should use pre-response-utils function', function() {
      // then
      expect(httpTestServer.hapiServer._core.extensions.route.onPreResponse.nodes[0].func.name).to.equal('handleDomainAndHttpErrors');
    });
  });
});
