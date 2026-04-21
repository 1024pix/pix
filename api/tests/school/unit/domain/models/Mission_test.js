import { Activity } from '../../../../../src/school/domain/models/Activity.js';
import { ActivityInfo } from '../../../../../src/school/domain/models/ActivityInfo.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErrSync } from '../../../../tooling/test-utils/error.js';

describe('Unit | Domain | School', function () {
  describe('#getChallengeId', function () {
    context('should return challenge id of accurate activity level in first step', function () {
      [
        { activityLevel: 'TUTORIAL', expectedChallengeId: 'tutorial-challenge-id-1' },
        { activityLevel: 'TRAINING', expectedChallengeId: 'training-challenge-id-1' },
        { activityLevel: 'VALIDATION', expectedChallengeId: 'validation-challenge-id-1' },
      ].forEach(({ activityLevel, expectedChallengeId }) => {
        it(`should return challenge id of activity ${activityLevel}`, function () {
          const mission = domainBuilder.buildMission({
            content: {
              steps: [
                {
                  tutorialChallenges: [['tutorial-challenge-id-1']],
                  trainingChallenges: [['training-challenge-id-1']],
                  validationChallenges: [['validation-challenge-id-1']],
                },
              ],
              dareChallenges: [['dare-challenge-id-1']],
            },
          });
          const challengeId = mission.getChallengeId({
            mission,
            activityInfo: new ActivityInfo({ stepIndex: 0, level: activityLevel }),
            challengeIndex: 0,
            alternativeVersion: 1,
          });

          expect(challengeId).to.equal(expectedChallengeId);
        });
      });
    });

    it('should return challenge id of accurate index in activity', function () {
      const mission = domainBuilder.buildMission({
        content: {
          steps: [
            {
              tutorialChallenges: [
                ['tutorial-challenge-id-1'],
                ['tutorial-challenge-id-2'],
                ['tutorial-challenge-id-3'],
              ],
            },
          ],
        },
      });
      const challengeId = mission.getChallengeId({
        activityInfo: new ActivityInfo({ level: Activity.levels.TUTORIAL, stepIndex: 0 }),
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
              steps: [
                {
                  tutorialChallenges: [
                    ['tutorial-challenge-id-1_1', 'tutorial-challenge-id-1_2', 'tutorial-challenge-id-1_3'],
                  ],
                },
              ],
            },
          });

          const challengeId = mission.getChallengeId({
            activityInfo: new ActivityInfo({ level: Activity.levels.TUTORIAL, stepIndex: 0 }),
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
              steps: [
                {
                  trainingChallenges: [['recThem1']],
                },
              ],
            },
          });
          const challengeId = mission.getChallengeId({
            activityInfo: new ActivityInfo({ level: Activity.levels.TRAINING, stepIndex: 0 }),
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
          steps: [
            {
              tutorialChallenges: [['tutorial-challenge-id-1']],
            },
          ],
        },
      });

      const result = mission.getChallengeId({
        activityInfo: new ActivityInfo({ level: Activity.levels.TUTORIAL, stepIndex: 0 }),
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
          activityInfo: new ActivityInfo({ level: 'BAD-ACTIVITY' }),
        });

        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal('Unknown activity level BAD-ACTIVITY');
      });
    });
  });

  describe('#getChallengeIds', function () {
    [
      {
        stepIndex: 0,
        activityLevel: Activity.levels.TUTORIAL,
        expectedChallengeIds: [['step_0-tutorial-challenge-id']],
      },
      {
        stepIndex: 0,
        activityLevel: Activity.levels.TRAINING,
        expectedChallengeIds: [['step_0-training-challenge-id']],
      },
      {
        stepIndex: 0,
        activityLevel: Activity.levels.VALIDATION,
        expectedChallengeIds: [['step_0-validation-challenge-id']],
      },
      {
        stepIndex: 0,
        activityLevel: Activity.levels.CHALLENGE,
        expectedChallengeIds: [['dare-challenge-id']],
      },
      {
        stepIndex: 1,
        activityLevel: Activity.levels.TUTORIAL,
        expectedChallengeIds: [['step_1-tutorial-challenge-id']],
      },
      {
        stepIndex: 1,
        activityLevel: Activity.levels.TRAINING,
        expectedChallengeIds: [['step_1-training-challenge-id']],
      },
      {
        stepIndex: 1,
        activityLevel: Activity.levels.VALIDATION,
        expectedChallengeIds: [['step_1-validation-challenge-id']],
      },
      {
        stepIndex: 1,
        activityLevel: Activity.levels.CHALLENGE,
        expectedChallengeIds: [['dare-challenge-id']],
      },
    ].forEach(({ stepIndex, activityLevel, expectedChallengeIds }) => {
      it(`should return ${expectedChallengeIds} for level ${activityLevel} and step ${stepIndex}`, function () {
        const mission = domainBuilder.buildMission({
          content: {
            steps: [
              {
                tutorialChallenges: [['step_0-tutorial-challenge-id']],
                trainingChallenges: [['step_0-training-challenge-id']],
                validationChallenges: [['step_0-validation-challenge-id']],
              },
              {
                tutorialChallenges: [['step_1-tutorial-challenge-id']],
                trainingChallenges: [['step_1-training-challenge-id']],
                validationChallenges: [['step_1-validation-challenge-id']],
              },
            ],
            dareChallenges: [['dare-challenge-id']],
          },
        });
        const challengeIds = mission.getChallengeIds(new ActivityInfo({ stepIndex, level: activityLevel }));

        expect(challengeIds).to.deep.equal(expectedChallengeIds);
      });
    });
  });

  describe('#getChallengeIndex', function () {
    it('should return the index of given challenge in given activity', function () {
      const mission = domainBuilder.buildMission({
        content: {
          steps: [
            {
              tutorialChallenges: [
                ['tutorial-challenge-id-1'],
                ['tutorial-challenge-id-2'],
                ['tutorial-challenge-id-3'],
              ],
            },
          ],
        },
      });
      const challengeIndex = mission.getChallengeIndex(
        new ActivityInfo({ level: Activity.levels.TUTORIAL, stepIndex: 0 }),
        'tutorial-challenge-id-2',
      );

      expect(challengeIndex).to.equal(1);
    });
  });

  describe('#getLastChallengeIds', function () {
    it('should index of given challenge in given activity', function () {
      const mission = domainBuilder.buildMission({
        content: {
          steps: [
            {
              tutorialChallenges: [
                ['tutorial-challenge-id-1'],
                ['tutorial-challenge-id-2'],
                ['tutorial-challenge-id-3'],
              ],
            },
          ],
        },
      });
      const lastChallengeIds = mission.getLastChallengeIds(
        new ActivityInfo({
          level: Activity.levels.TUTORIAL,
          stepIndex: 0,
        }),
      );

      expect(lastChallengeIds).to.deep.equal(['tutorial-challenge-id-3']);
    });
  });
});
