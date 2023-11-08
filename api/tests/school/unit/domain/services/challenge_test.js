import { catchErr, domainBuilder, expect, sinon } from '../../../../test-helper.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { challengeService } from '../../../../../src/school/domain/services/challenge.js';

import { Activity } from '../../../../../src/school/domain/models/Activity.js';

describe('Unit | Service | Challenge', function () {
  describe('#getChallenge', function () {
    it('calls challengeRepository#getChallengeFor1d with goods arguments', function () {
      const missionId = 'mission_id';
      const activityLevel = Activity.levels.TRAINING;
      const locale = 'fr';
      const challengeNumber = 1;
      const alternativeVersion = null;
      const challengeRepository = {
        getChallengeFor1d: sinon.stub(),
      };

      challengeService.getChallenge({
        missionId,
        activityLevel,
        challengeNumber,
        alternativeVersion,
        challengeRepository,
        locale,
      });

      expect(challengeRepository.getChallengeFor1d).to.have.been.calledOnceWith({
        missionId,
        activityLevel,
        challengeNumber,
        locale,
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
