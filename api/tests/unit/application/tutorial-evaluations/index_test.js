import { expect, HttpTestServer, sinon } from '../../../test-helper.js';
import { tutorialEvaluationsController } from '../../../../lib/shared/application/tutorial-evaluations/tutorial-evaluations-controller.js';
import * as moduleUnderTest from '../../../../lib/shared/application/tutorial-evaluations/index.js';
import { TutorialEvaluation } from '../../../../lib/shared/domain/models/TutorialEvaluation.js';

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
