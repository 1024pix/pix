import { domainBuilder, expect, sinon } from '../../../../test-helper.js';
import { activityChallengesService } from '../../../../../lib/domain/services/1d/activity-challenges.js';

import { Activity } from '../../../../../lib/domain/models/index.js';

describe('Unit | Service | Challenge', function () {
  describe('#getAllChallenges', function () {
    it('calls challengeRepository#getChallengeFor1d with goods arguments', function () {
      const missionId = 'mission_id';
      const activityLevel = Activity.levels.TRAINING;
      const challengeRepository = {
        getChallengeFor1d: sinon.stub(),
      };

      activityChallengesService.getAllChallenges({
        missionId,
        activityLevel,
        challengeRepository,
      });

      expect(challengeRepository.getChallengeFor1d).to.have.been.calledOnceWith({
        missionId,
        activityLevel,
        challengeNumber: 1,
      });
    });
    it('returns first challenge versions when there is only one challenge in the activity', async function () {
      const missionId = 'mission_id';
      const activityLevel = Activity.levels.TRAINING;
      const challengeRepository = {
        getChallengeFor1d: sinon.stub(),
      };

      const challenge = domainBuilder.buildChallenge();
      const firstDeclination = domainBuilder.buildChallenge({ alternativeVersion: 2 });
      const secondDeclination = domainBuilder.buildChallenge({ alternativeVersion: 3 });
      const firstChallengeAndDeclinations = [challenge, firstDeclination, secondDeclination];
      challengeRepository.getChallengeFor1d
        .withArgs({ missionId, activityLevel, challengeNumber: 1 })
        .resolves(firstChallengeAndDeclinations);

      const allChallenges = await activityChallengesService.getAllChallenges({
        missionId,
        activityLevel,
        challengeRepository,
      });

      expect(allChallenges.length).to.equal(1);
      expect(allChallenges[0]).to.equal(firstChallengeAndDeclinations);
    });
  });
});
