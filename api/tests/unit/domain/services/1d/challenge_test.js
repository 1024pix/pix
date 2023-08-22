import { expect, sinon, catchErr, domainBuilder } from '../../../../test-helper.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { getChallenge } from '../../../../../lib/domain/services/1d/challenge.js';
import { Activity } from '../../../../../lib/domain/models/index.js';

describe('Unit | Service | Challenge', function () {
  describe('#getChallenge', function () {
    it('calls challengeRepository#getForPix1D with goods arguments', function () {
      const missionId = 'mission_id';
      const activityLevel = Activity.levels.TRAINING;
      const challengeNumber = 1;
      const alternativeVersion = null;
      const challengeRepository = {
        getForPix1D: sinon.stub(),
      };

      getChallenge({
        missionId,
        activityLevel,
        challengeNumber,
        alternativeVersion,
        challengeRepository,
      });

      expect(challengeRepository.getForPix1D).to.have.been.calledOnceWith({
        missionId,
        activityLevel,
        challengeNumber,
      });
    });
    it('returns the challenge corresponding to the alternative version', async function () {
      const missionId = 'mission_id';
      const activityLevel = Activity.levels.TRAINING;
      const challengeNumber = 1;
      const alternativeVersion = 2;
      const challengeRepository = {
        getForPix1D: sinon.stub(),
      };
      const challenge1 = domainBuilder.buildChallenge({ alternativeVersion });
      const challenge2 = domainBuilder.buildChallenge({ alternativeVersion: 3 });
      const challenges = [challenge1, challenge2];
      challengeRepository.getForPix1D.resolves(challenges);
      const result = await getChallenge({
        missionId,
        activityLevel,
        challengeNumber,
        alternativeVersion,
        challengeRepository,
      });

      expect(result).to.equal(challenge1);
    });
    it('does not throw an error with a NotFoundError', async function () {
      const missionId = 'mission_id';
      const activityLevel = Activity.levels.TRAINING;
      const challengeNumber = 1;
      const alternativeVersion = null;
      const challengeRepository = {
        getForPix1D: sinon.stub(),
      };

      challengeRepository.getForPix1D.rejects(new NotFoundError());

      const functionToCall = async () => {
        await getChallenge({
          missionId,
          activityLevel,
          challengeNumber,
          alternativeVersion,
          challengeRepository,
        });
      };
      expect(functionToCall).to.not.throw();
    });
    it('throws an error when the error is not a NotFoundError', async function () {
      const missionId = 'mission_id';
      const activityLevel = Activity.levels.TRAINING;
      const challengeNumber = 1;
      const alternativeVersion = null;
      const challengeRepository = {
        getForPix1D: sinon.stub(),
      };

      challengeRepository.getForPix1D.rejects(new Error());
      const error = await catchErr(getChallenge)({
        missionId,
        activityLevel,
        challengeNumber,
        alternativeVersion,
        challengeRepository,
      });
      expect(error).not.to.be.instanceOf(NotFoundError);
    });
  });
});
