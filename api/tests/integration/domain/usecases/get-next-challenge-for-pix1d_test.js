import { domainBuilder, expect, sinon } from '../../../test-helper.js';
import { getNextChallengeForPix1d } from '../../../../lib/domain/usecases/get-next-challenge-for-pix1d.js';
import { Activity } from '../../../../lib/domain/models/Activity.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Integration | Domain | Use Cases | get-next-challenge-for-pix1d', function () {
  describe('#get-next-challenge-for-pix1d', function () {
    it('should return the first challenge of the first activity', async function () {
      // given
      const missionId = 'AZERTYUIO';
      const assessmentId = 'id_assessment';
      const activityId = 'id_activity';
      const firstChallenge = domainBuilder.buildChallenge({ id: 'first_challenge', skill: { name: '@didacticiel' } });
      const activity = new Activity({ id: activityId, level: Activity.levels.TUTORIAL, assessmentId });

      const assessmentRepository = { get: sinon.stub() };
      const answerRepository = { findByActivity: sinon.stub() };
      const challengeRepository = { getForPix1D: sinon.stub() };
      const activityRepository = { getLastActivity: sinon.stub(), save: sinon.stub() };
      activityRepository.getLastActivity.withArgs(assessmentId).rejects(new NotFoundError('No activity found.'));
      activityRepository.save
        .withArgs(new Activity({ assessmentId, level: Activity.levels.TUTORIAL }))
        .resolves(activity);

      assessmentRepository.get.withArgs(assessmentId).resolves({ missionId });
      answerRepository.findByActivity.withArgs(activityId).resolves([]);
      challengeRepository.getForPix1D
        .withArgs({ missionId, activityLevel: Activity.levels.TUTORIAL, challengeNumber: 1 })
        .resolves(firstChallenge);

      // when
      const nextChallenge = await getNextChallengeForPix1d({
        assessmentId,
        assessmentRepository,
        challengeRepository,
        answerRepository,
        activityRepository,
      });

      // then
      expect(nextChallenge).to.equal(firstChallenge);
    });
  });
});
