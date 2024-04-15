import { tutorialEvaluationsController } from '../../../../../src/devcomp/application/tutorial-evaluations/tutorial-evaluations-controller.js';
import { TutorialEvaluation } from '../../../../../src/devcomp/domain/models/TutorialEvaluation.js';
import { usecases } from '../../../../../src/devcomp/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | Tutorial-evaluations', function () {
  describe('#evaluate', function () {
    it('should call the expected usecase', async function () {
      // given
      const tutorialId = 'tutorialId';
      const userId = 'userId';
      const status = TutorialEvaluation.statuses.LIKED;
      const tutorialEvaluationSerializer = {
        deserialize: sinon.stub(),
      };
      tutorialEvaluationSerializer.deserialize.returns({
        status,
      });
      sinon.stub(usecases, 'addTutorialEvaluation').returns({
        id: 'tutorialEvaluationId',
      });

      const request = {
        auth: { credentials: { userId } },
        params: { tutorialId },
        payload: {
          data: {
            attributes: {
              status,
            },
          },
        },
      };

      // when
      await tutorialEvaluationsController.evaluate(request, hFake, { tutorialEvaluationSerializer });

      // then
      const addTutorialEvaluationArgs = usecases.addTutorialEvaluation.firstCall.args[0];
      expect(addTutorialEvaluationArgs).to.have.property('userId', userId);
      expect(addTutorialEvaluationArgs).to.have.property('tutorialId', tutorialId);
      expect(addTutorialEvaluationArgs).to.have.property('status', status);
    });
  });
});
