import { RewardTypeDoesNotExistError } from '../../../../../src/profile/domain/errors.js';
import { Attestation } from '../../../../../src/profile/domain/models/Attestation.js';
import { getByIdAndType } from '../../../../../src/profile/infrastructure/repositories/reward-repository.js';
import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { catchErr, databaseBuilder, expect } from '../../../../test-helper.js';

describe('Profile | Integration | Infrastructure | Repository | Reward', function () {
  describe('#getByIdAndType', function () {
    it('should return reward for given id and type', async function () {
      // given
      const reward = databaseBuilder.factory.buildAttestation();
      await databaseBuilder.commit();

      // when
      const result = await getByIdAndType({ rewardId: reward.id, rewardType: REWARD_TYPES.ATTESTATION });

      // then
      expect(result).to.be.an.instanceof(Attestation);
      expect(result.id).to.equal(reward.id);
      expect(result.key).to.equal(reward.key);
    });

    it('should throw RewardTypeDoesNotExistError if rewardType does not exist', async function () {
      // given&when
      const error = await catchErr(getByIdAndType)({ rewardId: 1, rewardType: 'NOT_EXISTING_REWARD_TYPE' });

      // then
      expect(error).to.be.an.instanceof(RewardTypeDoesNotExistError);
    });
  });
});
