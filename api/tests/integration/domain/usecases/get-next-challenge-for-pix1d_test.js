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
      const firstChallenge = domainBuilder.buildChallenge({ id: 'first_challenge', skill: { name: '@recherche_di1' } });
      const activityId = 'id_activity';
      const activity = new Activity({ id: activityId, level: Activity.levels.TUTORIAL, assessmentId });

      const assessmentRepository = { get: sinon.stub() };
      const activityAnswerRepository = { findByActivity: sinon.stub() };
      const challengeRepository = { getForPix1D: sinon.stub() };
      const activityRepository = {
        getLastActivity: sinon.stub(),
        save: sinon.stub(),
        getAllByAssessmentId: sinon.stub(),
      };
      activityRepository.getAllByAssessmentId.withArgs(assessmentId).resolves([]);
      activityRepository.getLastActivity.withArgs(assessmentId).rejects(new NotFoundError('No activity found.'));
      activityRepository.save
        .withArgs(new Activity({ assessmentId, level: Activity.levels.TUTORIAL }))
        .resolves(activity);

      assessmentRepository.get.withArgs(assessmentId).resolves({ missionId });
      activityAnswerRepository.findByActivity.withArgs(activityId).resolves([]);
      challengeRepository.getForPix1D
        .withArgs({ missionId, activityLevel: Activity.levels.TUTORIAL, challengeNumber: 1 })
        .resolves(firstChallenge);

      // when
      const nextChallenge = await getNextChallengeForPix1d({
        assessmentId,
        assessmentRepository,
        challengeRepository,
        activityAnswerRepository,
        activityRepository,
      });

      // then
      expect(nextChallenge).to.equal(firstChallenge);
    });
  });
});
