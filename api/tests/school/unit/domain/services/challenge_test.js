import { Activity } from '../../../../../src/school/domain/models/Activity.js';
import { challengeService } from '../../../../../src/school/domain/services/challenge.js';
import { domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Service | Challenge', function () {
  describe('#getAlternativeVersion', function () {
    describe('when the first challenge has multiple alternative versions', function () {
      context('when there is not any already played alternative versions', function () {
        it('returns a version randomly between all alternative versions', async function () {
          const activities = [new Activity({ level: Activity.levels.VALIDATION, alternativeVersion: 1 })];
          const mission = domainBuilder.buildMission({
            content: {
              trainingChallenges: [['challenge-id-alt1', 'challenge-id-alt2', 'challenge-id-alt3']],
            },
          });

          sinon.stub(Math, 'random').returns(0.6);
          const result = await challengeService.getAlternativeVersion({
            mission,
            activities,
            activityLevel: Activity.levels.TRAINING,
          });

          expect(result).to.equal(1);
        });
      });
      context('when there is an already played alternative version', function () {
        it('returns a version randomly between remaining alternative versions', async function () {
          const activities = [new Activity({ level: Activity.levels.TRAINING, alternativeVersion: 0 })];
          const mission = domainBuilder.buildMission({
            content: {
              trainingChallenges: [['challenge-id-alt1', 'challenge-id-alt2', 'challenge-id-alt3']],
            },
          });

          sinon.stub(Math, 'random').returns(0.6);
          const result = await challengeService.getAlternativeVersion({
            mission,
            activityLevel: Activity.levels.TRAINING,
            activities,
          });

          expect(result).to.equal(2);
        });
      });
      context('when there are already played alternative versions', function () {
        it('returns a version randomly between remaining alternative versions', async function () {
          const activities = [
            new Activity({ level: Activity.levels.TRAINING, alternativeVersion: 1 }),
            new Activity({ level: Activity.levels.TRAINING, alternativeVersion: 2 }),
          ];
          const mission = domainBuilder.buildMission({
            content: {
              trainingChallenges: [['challenge-id-alt1', 'challenge-id-alt2', 'challenge-id-alt3']],
            },
          });

          sinon.stub(Math, 'random').returns(0.6);
          const result = await challengeService.getAlternativeVersion({
            mission,
            activityLevel: Activity.levels.TRAINING,
            activities,
          });

          expect(result).to.equal(0);
        });
      });
      context('when all alternative versions have already been played', function () {
        it('returns a version randomly between all alternative versions', async function () {
          const activities = [
            new Activity({ level: Activity.levels.TRAINING, alternativeVersion: 0 }),
            new Activity({ level: Activity.levels.TRAINING, alternativeVersion: 1 }),
            new Activity({ level: Activity.levels.TRAINING, alternativeVersion: 2 }),
          ];
          const mission = domainBuilder.buildMission({
            content: {
              trainingChallenges: [['challenge-id-alt1', 'challenge-id-alt2', 'challenge-id-alt3']],
            },
          });

          sinon.stub(Math, 'random').returns(0.6);
          const result = await challengeService.getAlternativeVersion({
            mission,
            activityLevel: Activity.levels.TRAINING,
            activities,
          });

          expect(result).to.equal(1);
        });
      });
    });

    describe('when the first challenge has has one version and the second has multiple', function () {
      context('when there is not any already played alternative versions', function () {
        it('returns a version randomly between all alternative versions of the 2nd challenge', async function () {
          const activities = [new Activity({ level: Activity.levels.VALIDATION, alternativeVersion: 1 })];
          const mission = domainBuilder.buildMission({
            content: {
              trainingChallenges: [
                ['challenge-id1-alt1'],
                ['challenge-id2-alt1', 'challenge-id2-alt2', 'challenge-id2-alt3'],
              ],
            },
          });
          sinon.stub(Math, 'random').returns(0.6);
          const result = await challengeService.getAlternativeVersion({
            activities,
            mission,
            activityLevel: Activity.levels.TRAINING,
          });

          expect(result).to.equal(1);
        });
      });
      context('when there is an already played alternative version', function () {
        it('returns a version randomly between remaining alternative versions of the 2nd challenge', async function () {
          const activities = [new Activity({ level: Activity.levels.TRAINING, alternativeVersion: 0 })];
          const mission = domainBuilder.buildMission({
            content: {
              trainingChallenges: [
                ['challenge-id1-alt1'],
                ['challenge-id2-alt1', 'challenge-id2-alt2', 'challenge-id2-alt3'],
              ],
            },
          });

          sinon.stub(Math, 'random').returns(0.6);
          const result = await challengeService.getAlternativeVersion({
            activities,
            mission,
            activityLevel: Activity.levels.TRAINING,
          });
          expect(result).to.equal(2);
        });
      });
      context('when there are already played alternative versions', function () {
        it('returns a version randomly between remaining alternative versions', async function () {
          const activities = [
            new Activity({ level: Activity.levels.TRAINING, alternativeVersion: 1 }),
            new Activity({ level: Activity.levels.TRAINING, alternativeVersion: 2 }),
          ];
          const mission = domainBuilder.buildMission({
            content: {
              trainingChallenges: [
                ['challenge-id1-alt1'],
                ['challenge-id2-alt1', 'challenge-id2-alt2', 'challenge-id2-alt3'],
              ],
            },
          });

          sinon.stub(Math, 'random').returns(0.6);
          const result = await challengeService.getAlternativeVersion({
            activities,
            mission,
            activityLevel: Activity.levels.TRAINING,
          });

          expect(result).to.equal(0);
        });
      });
      context('when all alternative versions have already been played', function () {
        it('returns a version randomly between all alternative versions', async function () {
          const activities = [
            new Activity({ level: Activity.levels.TRAINING, alternativeVersion: 0 }),
            new Activity({ level: Activity.levels.TRAINING, alternativeVersion: 1 }),
            new Activity({ level: Activity.levels.TRAINING, alternativeVersion: 2 }),
          ];
          const mission = domainBuilder.buildMission({
            content: {
              trainingChallenges: [
                ['challenge-id1-alt1'],
                ['challenge-id2-alt1', 'challenge-id2-alt2', 'challenge-id2-alt3'],
              ],
            },
          });

          sinon.stub(Math, 'random').returns(0.6);
          const result = await challengeService.getAlternativeVersion({
            activities,
            mission,
            activityLevel: Activity.levels.TRAINING,
          });

          expect(result).to.equal(1);
        });
      });
    });
  });
});
