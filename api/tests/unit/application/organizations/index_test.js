const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const organizationController = require('../../../../lib/application/organizations/organization-controller');

let server;

function startServer() {
  server = Hapi.server();
  return server.register(require('../../../../lib/application/organizations'));
}

describe('Unit | Router | organization-router', () => {
  describe('GET /api/organizations', () => {

    beforeEach(() => {
      sinon.stub(organizationController, 'find').returns('ok');
      startServer();
    });

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/organizations?name=DRA&code=AZ&type=SCO&page=3&pageSize=25',
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });

  });

});
