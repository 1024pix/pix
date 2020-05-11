const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const tutorialEvaluationsController = require('../../../../lib/application/tutorial-evaluations/tutorial-evaluations-controller');

let server;

function startServer() {
  server = Hapi.server();
  return server.register(require('../../../../lib/application/tutorial-evaluations'));
}

describe('Unit | Router | tutorial-evaluations-router', () => {

  describe('PUT /api/users/tutorials/{tutorialId}/evaluate', () => {

    beforeEach(() => {
      sinon.stub(securityPreHandlers, 'checkUserIsAuthenticated').
        callsFake((request, h) => {
          h.continue({ credentials: { accessToken: 'jwt.access.token' } });
        });
      sinon.stub(tutorialEvaluationsController, 'evaluate').
        callsFake((request, h) => h.response().code(204));
      startServer();
    });

    it('should exist', async () => {
      // given
      const options = {
        method: 'PUT',
        url: '/api/users/tutorials/{tutorialId}/evaluate',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(tutorialEvaluationsController.evaluate).have.been.called;
      expect(response.statusCode).to.equal(204);
    });
  });

});
