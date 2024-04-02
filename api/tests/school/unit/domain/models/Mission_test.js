import { Activity } from '../../../../../src/school/domain/models/Activity.js';
import { catchErrSync, domainBuilder, expect } from '../../../../test-helper.js';

describe('Unit | Domain | School', function () {
  describe('#getChallengeId', function () {
    context('should return challenge id of accurate activity', function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      [
        { activityLevel: 'TUTORIAL', expectedChallengeId: 'tutorial-challenge-id-1' },
        { activityLevel: 'TRAINING', expectedChallengeId: 'training-challenge-id-1' },
        { activityLevel: 'VALIDATION', expectedChallengeId: 'validation-challenge-id-1' },
        { activityLevel: 'CHALLENGE', expectedChallengeId: 'dare-challenge-id-1' },
      ].forEach(({ activityLevel, expectedChallengeId }) => {
        it(`should return challenge id of activity ${activityLevel}`, function () {
          const mission = domainBuilder.buildMission({
            content: {
              tutorialChallenges: [['tutorial-challenge-id-1']],
              trainingChallenges: [['training-challenge-id-1']],
              validationChallenges: [['validation-challenge-id-1']],
              dareChallenges: [['dare-challenge-id-1']],
            },
          });
          const challengeId = mission.getChallengeId({
            mission,
            activityLevel,
            challengeIndex: 0,
            alternativeVersion: 1,
          });

          expect(challengeId).to.equal(expectedChallengeId);
        });
      });
    });

    it('should call challengeRepository#get with challenge id of accurate number in activity', function () {
      const mission = domainBuilder.buildMission({
        content: {
          tutorialChallenges: [['tutorial-challenge-id-1'], ['tutorial-challenge-id-2'], ['tutorial-challenge-id-3']],
        },
      });
      const challengeId = mission.getChallengeId({
        mission,
        activityLevel: Activity.levels.TUTORIAL,
        challengeIndex: 1,
        alternativeVersion: 1,
      });

      expect(challengeId).to.equal('tutorial-challenge-id-2');
    });

    context('with alternativeVersion', function () {
      context('when there is a challenge corresponding to the alternative version', function () {
        it('returns the challenge corresponding to the alternative version', async function () {
          const mission = domainBuilder.buildMission({
            content: {
              tutorialChallenges: [
                ['tutorial-challenge-id-1_1', 'tutorial-challenge-id-1_2', 'tutorial-challenge-id-1_3'],
              ],
            },
          });

          const challengeId = mission.getChallengeId({
            mission,
            activityLevel: Activity.levels.TUTORIAL,
            challengeIndex: 0,
            alternativeVersion: 2,
          });

          expect(challengeId).to.equal('tutorial-challenge-id-1_3');
        });
      });
      context('when there is only one version of the challenge', function () {
        it('returns the first challenge', async function () {
          const mission = domainBuilder.buildMission({
            content: {
              trainingChallenges: [['recThem1']],
            },
          });
          const challengeId = mission.getChallengeId({
            mission,
            activityLevel: Activity.levels.TRAINING,
            alternativeVersion: 2,
            challengeIndex: 0,
          });

          expect(challengeId).to.equal('recThem1');
        });
      });
    });

    it('returns undefined if there is no challenge for activity and number', async function () {
      const mission = domainBuilder.buildMission({
        content: {
          tutorialChallenges: [['tutorial-challenge-id-1']],
        },
      });

      const result = mission.getChallengeId({
        activityLevel: Activity.levels.TUTORIAL,
        challengeIndex: 2,
        alternativeVersion: 1,
      });

      expect(result).to.equal(undefined);
    });

    context('error management', function () {
      it('throws an Error with unknown activity level', async function () {
        const mission = domainBuilder.buildMission();
        const error = await catchErrSync(
          mission.getChallengeId,
          mission,
        )({
          activityLevel: 'BAD-ACTIVITY',
        });

        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal('Unknown activity level BAD-ACTIVITY');
      });
    });
  });
});
