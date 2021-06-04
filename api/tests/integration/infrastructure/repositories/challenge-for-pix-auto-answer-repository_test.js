const { expect, mockLearningContent } = require('../../../test-helper');
const challengeForPixAutoAnswerRepository = require('../../../../lib/infrastructure/repositories/challenge-for-pix-auto-answer-repository');

describe('Integration | Repository | challenge-for-pix-auto-answer-repository', () => {

  describe('#get', () => {
    it('should return the requested challenge for pix-auto-answer', async () => {
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
