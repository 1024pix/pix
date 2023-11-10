import { expect, sinon } from '../../../../test-helper.js';
import { saveFeedback } from '../../../../../src/evaluation/domain/usecases/save-feedback.js';

describe('Unit | UseCase | save-feedback', function () {
  describe('when there is a feedback to save', function () {
    it('should save the feedback', async function () {
      // given
      const feedbackToSave = Symbol('feedback');
      const feedbackRepository = { save: sinon.stub() };

      // when
      await saveFeedback({ feedback: feedbackToSave, feedbackRepository });

      // then
      expect(feedbackRepository.save).to.have.been.calledWithExactly(feedbackToSave);
    });
  });
});
