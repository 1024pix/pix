import { ATTESTATIONS } from '../../../../../src/profile/domain/constants.js';
import { RewardTypeDoesNotExistError } from '../../../../../src/profile/domain/errors.js';
import { Attestation } from '../../../../../src/profile/domain/models/Attestation.js';
import { Reward } from '../../../../../src/profile/domain/models/Reward.js';
import { getByIdAndType } from '../../../../../src/profile/infrastructure/repositories/reward-repository.js';
import { getByAttestationKey } from '../../../../../src/profile/infrastructure/repositories/reward-repository.js';
import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

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
  describe('#getByAttestationKey', function () {
    it('should return the correct attestation for a given key', async function () {
      //given
      const attestation = await databaseBuilder.factory.buildAttestation({ key: ATTESTATIONS.PARENTHOOD });

      await databaseBuilder.commit();

      //when
      const result = await getByAttestationKey({ key: attestation.key });

      //then
      expect(result).to.deep.equal(new Reward({ id: attestation.id, type: REWARD_TYPES.ATTESTATION }));
    });

    it('should throw not found error if no attestation match given key', async function () {
      //given
      await databaseBuilder.factory.buildAttestation({ key: ATTESTATIONS.PARENTHOOD });
      await databaseBuilder.commit();

      //when
      const error = await catchErr(getByAttestationKey)({ key: 'unknown_key' });

      //then
      expect(error).to.instanceOf(NotFoundError);
      expect(error.message).to.equal('Attestation not found.');
    });
  });
});
