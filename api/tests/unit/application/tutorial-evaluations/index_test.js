const { expect, HttpTestServer, sinon } = require('../../../test-helper');
const tutorialEvaluationsController = require('../../../../lib/application/tutorial-evaluations/tutorial-evaluations-controller');
const moduleUnderTest = require('../../../../lib/application/tutorial-evaluations');

describe('Unit | Router | tutorial-evaluations-router', function () {
  describe('PUT /api/users/tutorials/{tutorialId}/evaluate', function () {
    it('should exist', async function () {
      // given
      sinon.stub(tutorialEvaluationsController, 'evaluate').callsFake((request, h) => h.response('ok').code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'PUT';
      const url = '/api/users/tutorials/{tutorialId}/evaluate';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(tutorialEvaluationsController.evaluate).have.been.called;
      expect(response.statusCode).to.equal(204);
    });
  });
});
