const { sinon, expect, hFake } = require('../../../test-helper');
const tutorialEvaluationsController = require('../../../../lib/application/tutorial-evaluations/tutorial-evaluations-controller');
const usecases = require('../../../../lib/domain/usecases');
const TutorialEvaluation = require('../../../../lib/domain/models/TutorialEvaluation');
const tutorialEvaluationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/tutorial-evaluation-serializer');

describe('Unit | Controller | Tutorial-evaluations', function () {
  describe('#evaluate', function () {
    it('should call the expected usecase', async function () {
      // given
      const tutorialId = 'tutorialId';
      const userId = 'userId';
      const status = TutorialEvaluation.status.LIKED;
      sinon.stub(tutorialEvaluationSerializer, 'deserialize').returns({
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
      await tutorialEvaluationsController.evaluate(request, hFake);

      // then
      const addTutorialEvaluationArgs = usecases.addTutorialEvaluation.firstCall.args[0];
      expect(addTutorialEvaluationArgs).to.have.property('userId', userId);
      expect(addTutorialEvaluationArgs).to.have.property('tutorialId', tutorialId);
      expect(addTutorialEvaluationArgs).to.have.property('status', status);
    });
  });
});
