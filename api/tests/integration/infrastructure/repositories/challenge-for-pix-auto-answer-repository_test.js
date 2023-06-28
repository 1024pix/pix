import { expect, mockLearningContent } from '../../../test-helper.js';
import * as challengeForPixAutoAnswerRepository from '../../../../lib/shared/infrastructure/repositories/challenge-for-pix-auto-answer-repository.js';

describe('Integration | Repository | challenge-for-pix-auto-answer-repository', function () {
  describe('#get', function () {
    it('should return the requested challenge for pix-auto-answer', async function () {
      // given
      const challengeId = 'challenge_id';
      const challengeSolution = 'solution';
      const learningContent = {
        challenges: [{ id: challengeId, solution: challengeSolution, type: 'QROC', autoReply: false }],
      };

      mockLearningContent(learningContent);

      // when
      const challenge = await challengeForPixAutoAnswerRepository.get(challengeId);

      // then
      expect(challenge.id).to.equal(challengeId);
      expect(challenge.solution).to.equal(challengeSolution);
      expect(challenge.type).to.equal('QROC');
      expect(challenge.autoReply).to.equal(false);
    });
  });
});
