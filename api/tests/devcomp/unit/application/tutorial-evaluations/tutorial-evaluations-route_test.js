import sinon from 'sinon';

import { tutorialEvaluationsController } from '../../../../../src/devcomp/application/tutorial-evaluations/tutorial-evaluations-controller.js';
import { tutorialEvaluationsRoute as moduleUnderTest } from '../../../../../src/devcomp/application/tutorial-evaluations/tutorial-evaluations-route.js';
import { TutorialEvaluation } from '../../../../../src/devcomp/domain/models/TutorialEvaluation.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

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
