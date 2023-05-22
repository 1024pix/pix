import { sinon, expect, hFake } from '../../../test-helper.js';
import { tutorialEvaluationsController } from '../../../../lib/application/tutorial-evaluations/tutorial-evaluations-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { TutorialEvaluation } from '../../../../lib/domain/models/TutorialEvaluation.js';

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
