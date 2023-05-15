const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getNextChallengeForPix1d = require('../../../../lib/domain/usecases/get-next-challenge-for-pix1d');

describe('Integration | Domain | Use Cases | get-next-challenge-for-pix1d', function () {
  describe('#get-next-challenge-for-pix1d', function () {
    it('should return the first challenge of the first activity', async function () {
      // given
      const missionId = 'AZERTYUIO';
      const assessmentId = 'id_assessment';
      const DIDACTICIEL = 'didacticiel';
      const firstChallenge = domainBuilder.buildChallenge({ id: 'first_challenge', skill: { name: '@didacticiel' } });

      const assessmentRepository = { get: sinon.stub() };
      const answerRepository = { findByAssessment: sinon.stub() };
      const challengeRepository = { getForPix1D: sinon.stub() };

      assessmentRepository.get.withArgs(assessmentId).resolves({ missionId });
      answerRepository.findByAssessment.withArgs(assessmentId).resolves([]);
      challengeRepository.getForPix1D
        .withArgs({ missionId, activityLevel: DIDACTICIEL, answerLength: 0 })
        .resolves(firstChallenge);

      // when
      const nextChallenge = await getNextChallengeForPix1d({
        assessmentId,
        assessmentRepository,
        challengeRepository,
        answerRepository,
      });

      // then
      expect(nextChallenge).to.equal(firstChallenge);
    });
  });
});
