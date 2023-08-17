import { saveFeedback } from '../../../../lib/domain/usecases/save-feedback.js';
import { expect, sinon } from '../../../test-helper.js';

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
