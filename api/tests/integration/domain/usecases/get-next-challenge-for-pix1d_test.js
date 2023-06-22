import { expect, sinon, domainBuilder } from '../../../test-helper.js';
import { getNextChallengeForPix1d } from '../../../../lib/domain/usecases/get-next-challenge-for-pix1d.js';

describe('Integration | Domain | Use Cases | get-next-challenge-for-pix1d', function () {
  describe('#get-next-challenge-for-pix1d', function () {
    it('should return the first challenge of the first activity', async function () {
      // given
      const missionId = 'AZERTYUIO';
      const assessmentId = 'id_assessment';
      const DIDACTICIEL = 'di';
      const firstChallenge = domainBuilder.buildChallenge({ id: 'first_challenge', skill: { name: '@recherche_di1' } });

      const assessmentRepository = { get: sinon.stub() };
      const answerRepository = { findByAssessment: sinon.stub() };
      const challengeRepository = { getForPix1D: sinon.stub() };

      assessmentRepository.get.withArgs(assessmentId).resolves({ missionId });
      answerRepository.findByAssessment.withArgs(assessmentId).resolves([]);
      challengeRepository.getForPix1D
        .withArgs({ missionId, activityLevel: DIDACTICIEL, challengeNumber: 1 })
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
