const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const userTutorialsController = require('../../../../lib/application/user-tutorials/user-tutorials-controller');

let server;

function startServer() {
  server = Hapi.server();
  return server.register(require('../../../../lib/application/user-tutorials'));
}

describe('Unit | Router | user-tutorials-router', () => {

  describe('PUT /api/users/tutorials/{tutorialId}', () => {

    beforeEach(() => {
      sinon.stub(securityPreHandlers, 'checkUserIsAuthenticated').
        callsFake((request, h) => {
          h.continue({ credentials: { accessToken: 'jwt.access.token' } });
        });
      sinon.stub(userTutorialsController, 'add').
        callsFake((request, h) => h.response().code(204));
      startServer();
    });

    it('should exist', async () => {
      // given
      const options = {
        method: 'PUT',
        url: '/api/users/tutorials/{tutorialId}',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(userTutorialsController.add).have.been.called;
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('GET /api/users/tutorials', () => {

    beforeEach(() => {
      sinon.stub(securityPreHandlers, 'checkUserIsAuthenticated').
        callsFake((request, h) => {
          h.continue({ credentials: { accessToken: 'jwt.access.token' } });
        });
      sinon.stub(userTutorialsController, 'find').
        callsFake((request, h) => h.response().code(200));
      startServer();
    });

    it('should exist', async () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/users/tutorials',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(userTutorialsController.find).have.been.called;
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('DELETE /api/users/tutorials/{tutorialId}', () => {

    beforeEach(() => {
      sinon.stub(securityPreHandlers, 'checkUserIsAuthenticated').
        callsFake((request, h) => {
          h.continue({ credentials: { accessToken: 'jwt.access.token' } });
        });
      sinon.stub(userTutorialsController, 'removeFromUser').
        callsFake((request, h) => h.response().code(204));
      startServer();
    });

    it('should exist', async () => {
      // given
      const options = {
        method: 'DELETE',
        url: '/api/users/tutorials/tutorialId',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(userTutorialsController.removeFromUser).have.been.called;
      expect(response.statusCode).to.equal(204);
    });
  });

});
