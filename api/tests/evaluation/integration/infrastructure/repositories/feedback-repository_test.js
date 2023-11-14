import { expect } from '../../../../test-helper.js';
import { save } from '../../../../../src/evaluation/infrastructure/repositories/feedback-repository.js';
import { Feedback } from '../../../../../src/evaluation/domain/models/Feedback.js';

describe('Integration | Repository | Feedback', function () {
  describe('save', function () {
    it('should save a feedback in database', async function () {
      // given
      const feedbackToSave = {
        id: 969,
        content: 'test',
        answer: 'dummy answer',
        category: 'dummy category',
        challengeId: '123',
      };

      // when
      const savedFeedback = await save(feedbackToSave);

      // then
      expect(savedFeedback).to.be.instanceof(Feedback);
      expect(savedFeedback).to.include({
        content: feedbackToSave.content,
        challengeId: feedbackToSave.challengeId,
        category: feedbackToSave.category,
        answer: feedbackToSave.answer,
        assessmentId: null,
        userAgent: null,
      });
      expect(savedFeedback.id).to.not.equal(969);
    });
  });
});
