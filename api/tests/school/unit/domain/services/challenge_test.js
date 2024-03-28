import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { Activity } from '../../../../../src/school/domain/models/Activity.js';
import { MissionContent } from '../../../../../src/school/domain/models/Mission.js';
import { challengeService } from '../../../../../src/school/domain/services/challenge.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Service | Challenge', function () {
  describe('#getChallenge', function () {
    it('should return a challenge', async function () {
      const mission = domainBuilder.buildMission({
        content: new MissionContent({
          trainingChallenges: [['challenge-id']],
        }),
      });
      const activityLevel = Activity.levels.TRAINING;
      const challengeNumber = 1;
      const alternativeVersion = null;
      const sharedChallengeRepository = {
        get: sinon.stub(),
      };
      const expectedChallenge = domainBuilder.buildChallenge({ id: 'challenge-id' });
      sharedChallengeRepository.get.resolves(expectedChallenge);

      const challenge = await challengeService.getChallenge({
        mission,
        activityLevel,
        challengeNumber,
        alternativeVersion,
        sharedChallengeRepository,
      });

      expect(challenge).to.deep.equal(expectedChallenge);
    });
    context('should call sharedChallengeRepository#get with challenge id of accurate activity', function () {
      let mission;
      beforeEach(function () {
        mission = domainBuilder.buildMission({
          content: new MissionContent({
            tutorialChallenges: [['tutorial-challenge-id-1']],
            trainingChallenges: [['training-challenge-id-1']],
            validationChallenges: [['validation-challenge-id-1']],
            dareChallenges: [['dare-challenge-id-1']],
          }),
        });
      });

      // eslint-disable-next-line mocha/no-setup-in-describe
      [
        { activityLevel: 'TUTORIAL', challengeId: 'tutorial-challenge-id-1' },
        { activityLevel: 'TRAINING', challengeId: 'training-challenge-id-1' },
        { activityLevel: 'VALIDATION', challengeId: 'validation-challenge-id-1' },
        { activityLevel: 'CHALLENGE', challengeId: 'dare-challenge-id-1' },
      ].forEach(({ activityLevel, challengeId }) => {
        it(`should call sharedChallengeRepository#get with accurate challenge id for activity ${activityLevel}`, function () {
          const challengeNumber = 2;
          const alternativeVersion = null;
          const sharedChallengeRepository = {
            get: sinon.stub(),
          };

          challengeService.getChallenge({
            mission,
            activityLevel,
            challengeNumber,
            alternativeVersion,
            sharedChallengeRepository,
          });

          expect(sharedChallengeRepository.get).to.have.been.calledOnceWith(challengeId);
        });
      });
    });

    describe('with alternativeVersion', function () {
      context('when there is a challenge corresponding to the alternative version', function () {
        it('returns the challenge corresponding to the alternative version', async function () {
          const missionId = 'mission_id';
          const activityLevel = Activity.levels.TRAINING;
          const locale = 'fr';
          const challengeRepository = {
            getChallengeFor1d: sinon.stub(),
          };
          const challenge1 = domainBuilder.buildChallenge();
          const challenge2 = domainBuilder.buildChallenge({ alternativeVersion: 2 });
          const challenge3 = domainBuilder.buildChallenge({ alternativeVersion: 3 });
          const challenges = [challenge1, challenge2, challenge3];
          challengeRepository.getChallengeFor1d.resolves(challenges);
          const result = await challengeService.getChallenge({
            missionId,
            activityLevel,
            alternativeVersion: 2,
            challengeRepository,
            locale,
          });

          expect(result).to.equal(challenge2);
        });
      });
      context('when there is only one version of the challenge', function () {
        it('returns the challenge with undefined alternative version', async function () {
          const missionId = 'mission_id';
          const activityLevel = Activity.levels.TRAINING;
          const locale = 'fr';
          const challengeRepository = {
            getChallengeFor1d: sinon.stub(),
          };
          const challenge1 = domainBuilder.buildChallenge();
          challengeRepository.getChallengeFor1d.resolves([challenge1]);
          const result = await challengeService.getChallenge({
            missionId,
            activityLevel,
            alternativeVersion: 2,
            challengeRepository,
            locale,
          });

          expect(result).to.equal(challenge1);
        });
      });
    });

    it('does not throw an error with a NotFoundError', async function () {
      const missionId = 'mission_id';
      const activityLevel = Activity.levels.TRAINING;
      const locale = 'fr';
      const alternativeVersion = null;
      const challengeRepository = {
        getChallengeFor1d: sinon.stub(),
      };

      challengeRepository.getChallengeFor1d.rejects(new NotFoundError());

      const functionToCall = async () => {
        await challengeService.getChallenge({
          missionId,
          activityLevel,
          alternativeVersion,
          challengeRepository,
          locale,
        });
      };
      expect(functionToCall).to.not.throw();
    });

    it('throws an error when the error is not a NotFoundError', async function () {
      const missionId = 'mission_id';
      const activityLevel = Activity.levels.TRAINING;
      const locale = 'fr';
      const alternativeVersion = null;
      const challengeRepository = {
        getChallengeFor1d: sinon.stub(),
      };

      challengeRepository.getChallengeFor1d.rejects(new Error());
      const error = await catchErr(challengeService.getChallenge)({
        missionId,
        activityLevel,
        alternativeVersion,
        challengeRepository,
        locale,
      });
      expect(error).not.to.be.instanceOf(NotFoundError);
    });
  });

  describe('#getAlternativeVersion', function () {
    let challengeRepository;

    before(function () {
      challengeRepository = {
        getActivityChallengesFor1d: sinon.stub(),
      };
    });

    describe('when the first challenge has multiple alternative versions', function () {
      context('when there is not any already played alternative versions', function () {
        it('returns a version randomly between all alternative versions', async function () {
          const challenges = [
            domainBuilder.buildChallenge({ alternativeVersion: undefined }),
            domainBuilder.buildChallenge({ alternativeVersion: 2 }),
            domainBuilder.buildChallenge({ alternativeVersion: 3 }),
          ];
          challengeRepository.getActivityChallengesFor1d.resolves([challenges]);

          sinon.stub(Math, 'random').returns(0.6);
          const result = await challengeService.getAlternativeVersion({
            missionId: 'mission_id',
            activityLevel: Activity.levels.TRAINING,
            alreadyPlayedAlternativeVersions: [],
            challengeRepository,
          });

          expect(result).to.equal(2);
        });
      });
      context('when there is an already played alternative version', function () {
        it('returns a version randomly between remaining alternative versions', async function () {
          const challenges = [
            domainBuilder.buildChallenge({ alternativeVersion: undefined }),
            domainBuilder.buildChallenge({ alternativeVersion: 2 }),
            domainBuilder.buildChallenge({ alternativeVersion: 3 }),
          ];
          challengeRepository.getActivityChallengesFor1d.resolves([challenges]);

          sinon.stub(Math, 'random').returns(0.6);
          const result = await challengeService.getAlternativeVersion({
            missionId: 'mission_id',
            activityLevel: Activity.levels.TRAINING,
            challengeNumber: 1,
            alreadyPlayedAlternativeVersions: [undefined],
            challengeRepository,
          });

          expect(result).to.equal(3);
        });
      });
      context('when there are already played alternative versions', function () {
        it('returns a version randomly between remaining alternative versions', async function () {
          const challenges = [
            domainBuilder.buildChallenge({ alternativeVersion: undefined }),
            domainBuilder.buildChallenge({ alternativeVersion: 2 }),
            domainBuilder.buildChallenge({ alternativeVersion: 3 }),
          ];
          challengeRepository.getActivityChallengesFor1d.resolves([challenges]);

          sinon.stub(Math, 'random').returns(0.6);
          const result = await challengeService.getAlternativeVersion({
            missionId: 'mission_id',
            activityLevel: Activity.levels.TRAINING,
            alreadyPlayedAlternativeVersions: [2, 3],
            challengeRepository,
          });

          expect(result).to.equal(undefined);
        });
      });
      context('when all alternative versions have already been played', function () {
        it('returns a version randomly between all alternative versions', async function () {
          const challenges = [
            domainBuilder.buildChallenge({ alternativeVersion: undefined }),
            domainBuilder.buildChallenge({ alternativeVersion: 2 }),
            domainBuilder.buildChallenge({ alternativeVersion: 3 }),
          ];
          challengeRepository.getActivityChallengesFor1d.resolves([challenges]);

          sinon.stub(Math, 'random').returns(0.6);
          const result = await challengeService.getAlternativeVersion({
            missionId: 'mission_id',
            activityLevel: Activity.levels.TRAINING,
            alreadyPlayedAlternativeVersions: [undefined, 2, 3],
            challengeRepository,
          });

          expect(result).to.equal(2);
        });
      });
    });

    describe('when the first challenge has has one version and the second has multiple', function () {
      context('when there is not any already played alternative versions', function () {
        it('returns a version randomly between all alternative versions of the 2nd challenge', async function () {
          const firstChallengeAlternatives = [domainBuilder.buildChallenge({ alternativeVersion: undefined })];
          const secondChallengeAlternatives = [
            domainBuilder.buildChallenge({ alternativeVersion: undefined }),
            domainBuilder.buildChallenge({ alternativeVersion: 2 }),
            domainBuilder.buildChallenge({ alternativeVersion: 3 }),
          ];
          challengeRepository.getActivityChallengesFor1d.resolves([
            firstChallengeAlternatives,
            secondChallengeAlternatives,
          ]);

          sinon.stub(Math, 'random').returns(0.6);
          const result = await challengeService.getAlternativeVersion({
            missionId: 'mission_id',
            activityLevel: Activity.levels.TRAINING,
            alreadyPlayedAlternativeVersions: [],
            challengeRepository,
          });

          expect(result).to.equal(2);
        });
      });
      context('when there is an already played alternative version', function () {
        it('returns a version randomly between remaining alternative versions of the 2nd challenge', async function () {
          const firstChallengeAlternatives = [domainBuilder.buildChallenge({ alternativeVersion: undefined })];
          const secondChallengeAlternatives = [
            domainBuilder.buildChallenge({ alternativeVersion: undefined }),
            domainBuilder.buildChallenge({ alternativeVersion: 2 }),
            domainBuilder.buildChallenge({ alternativeVersion: 3 }),
          ];
          challengeRepository.getActivityChallengesFor1d.resolves([
            firstChallengeAlternatives,
            secondChallengeAlternatives,
          ]);

          sinon.stub(Math, 'random').returns(0.6);
          const result = await challengeService.getAlternativeVersion({
            missionId: 'mission_id',
            activityLevel: Activity.levels.TRAINING,
            alreadyPlayedAlternativeVersions: [undefined],
            challengeRepository,
          });

          expect(result).to.equal(3);
        });
      });
      context('when there are already played alternative versions', function () {
        it('returns a version randomly between remaining alternative versions', async function () {
          const firstChallengeAlternatives = [domainBuilder.buildChallenge({ alternativeVersion: undefined })];
          const secondChallengeAlternatives = [
            domainBuilder.buildChallenge({ alternativeVersion: undefined }),
            domainBuilder.buildChallenge({ alternativeVersion: 2 }),
            domainBuilder.buildChallenge({ alternativeVersion: 3 }),
          ];
          challengeRepository.getActivityChallengesFor1d.resolves([
            firstChallengeAlternatives,
            secondChallengeAlternatives,
          ]);

          sinon.stub(Math, 'random').returns(0.6);
          const result = await challengeService.getAlternativeVersion({
            missionId: 'mission_id',
            activityLevel: Activity.levels.TRAINING,
            alreadyPlayedAlternativeVersions: [2, 3],
            challengeRepository,
          });

          expect(result).to.equal(undefined);
        });
      });
      context('when all alternative versions have already been played', function () {
        it('returns a version randomly between all alternative versions', async function () {
          const firstChallengeAlternatives = [domainBuilder.buildChallenge({ alternativeVersion: undefined })];
          const secondChallengeAlternatives = [
            domainBuilder.buildChallenge({ alternativeVersion: undefined }),
            domainBuilder.buildChallenge({ alternativeVersion: 2 }),
            domainBuilder.buildChallenge({ alternativeVersion: 3 }),
          ];
          challengeRepository.getActivityChallengesFor1d.resolves([
            firstChallengeAlternatives,
            secondChallengeAlternatives,
          ]);

          sinon.stub(Math, 'random').returns(0.6);
          const result = await challengeService.getAlternativeVersion({
            missionId: 'mission_id',
            activityLevel: Activity.levels.TRAINING,
            alreadyPlayedAlternativeVersions: [undefined, 2, 3],
            challengeRepository,
          });

          expect(result).to.equal(2);
        });
      });
    });
  });
});
