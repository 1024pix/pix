const { sinon, expect, hFake } = require('../../../test-helper');
const tutorialEvaluationsController = require('../../../../lib/application/tutorial-evaluations/tutorial-evaluations-controller');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Controller | Tutorial-evaluations', function() {

  describe('#evaluate', function() {
    it('should call the expected usecase', async function() {
      // given
      const tutorialId = 'tutorialId';
      const userId = 'userId';
      sinon.stub(usecases, 'addTutorialEvaluation').returns({
        id: 'tutorialEvaluationId'
      });

      const request = {
        auth: { credentials: { userId } },
        params: { tutorialId }
      };

      // when
      await tutorialEvaluationsController.evaluate(request, hFake);

      // then
      const addTutorialEvaluationArgs = usecases.addTutorialEvaluation.firstCall.args[0];
      expect(addTutorialEvaluationArgs).to.have.property('userId', userId);
      expect(addTutorialEvaluationArgs).to.have.property('tutorialId', tutorialId);
    });
  });
});
