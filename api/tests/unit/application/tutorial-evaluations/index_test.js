import { expect, HttpTestServer, sinon } from '../../../test-helper';
import tutorialEvaluationsController from '../../../../lib/application/tutorial-evaluations/tutorial-evaluations-controller';
import moduleUnderTest from '../../../../lib/application/tutorial-evaluations';
import TutorialEvaluation from '../../../../lib/domain/models/TutorialEvaluation';

describe('Unit | Router | tutorial-evaluations-router', function () {
  describe('PUT /api/users/tutorials/{tutorialId}/evaluate', function () {
    it('should exist', async function () {
      // given
      sinon.stub(tutorialEvaluationsController, 'evaluate').callsFake((request, h) => h.response('ok').code(201));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'PUT';
      const url = '/api/users/tutorials/{tutorialId}/evaluate';
      const payload = { data: { attributes: { status: TutorialEvaluation.statuses.LIKED } } };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(tutorialEvaluationsController.evaluate).have.been.called;
      expect(response.statusCode).to.equal(201);
    });
  });
});
