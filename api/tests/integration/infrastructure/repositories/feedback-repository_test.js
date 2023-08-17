import { Feedback } from '../../../../lib/domain/models/Feedback.js';
import { save } from '../../../../lib/infrastructure/repositories/feedback-repository.js';
import { expect } from '../../../test-helper.js';

describe('Integration | Repository | Feedback', function () {
  describe('save', function () {
    it('should save a feedback in database', async function () {
      // given
      const feedbackToSave = { content: 'test', challengeId: '123' };

      // when
      const savedFeedback = await save(feedbackToSave);

      // then
      expect(savedFeedback).to.be.instanceof(Feedback);
      expect(savedFeedback).to.include({
        content: feedbackToSave.content,
        challengeId: feedbackToSave.challengeId,
        category: null,
        answer: null,
        assessmentId: null,
        userAgent: null,
      });
    });
  });
});
