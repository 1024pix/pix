const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const userTutorialsController = require('../../../../lib/application/user-tutorials/user-tutorials-controller');

let server;

function startServer() {
  server = Hapi.server();
  return server.register(require('../../../../lib/application/user-tutorials'));
}

describe('Unit | Router | user-tutorials-router', () => {

  describe('PUT /api/tutorials', () => {
  describe('PUT /api/users/me/tutorials/{tutorialId}', () => {

    beforeEach(() => {
      sinon.stub(securityController, 'checkUserIsAuthenticated').
        callsFake((request, h) => {
          h.continue({ credentials: { accessToken: 'jwt.access.token' } });
        });
      sinon.stub(userTutorialsController, 'addToUser').
        callsFake((request, h) => h.response().code(204));
      startServer();
    });

    it('should exist', async () => {
      // given
      const options = {
        method: 'PUT',
        url: '/api/users/me/tutorials/{tutorialId}',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(userTutorialsController.addToUser).have.been.called;
      expect(response.statusCode).to.equal(204);
    });
  });

});
