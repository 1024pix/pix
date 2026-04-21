import sinon from 'sinon';

import { getByAttestationKey, getByIdAndType } from '../../../../../src/profile/application/api/reward-api.js';
import { Reward } from '../../../../../src/profile/domain/models/Reward.js';
import { usecases } from '../../../../../src/profile/domain/usecases/index.js';
import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';

describe('Profile | Unit | Application | Api | reward', function () {
  describe('#getByIdAndType', function () {
    it('should return reward for id and type', async function () {
      // given
      const rewardSymbol = Symbol('reward');
      const rewardId = 1;
      const rewardType = 'attestations';

      sinon.stub(usecases, 'getRewardByIdAndType');

      usecases.getRewardByIdAndType.withArgs({ rewardId, rewardType }).resolves(rewardSymbol);

      // when
      const result = await getByIdAndType({ rewardId, rewardType });

      // then
      expect(result).to.equal(rewardSymbol);
    });
  });
  describe('#getByAttestationKey', function () {
    it('should return a reward for a given attestation key', async function () {
      //given
      sinon.stub(usecases, 'getByAttestationKey');
      const reward = new Reward({ id: 1, type: REWARD_TYPES.ATTESTATION });

      usecases.getByAttestationKey.withArgs({ key: 1 }).resolves(reward);

      const result = await getByAttestationKey({ key: 1 });
      expect(result).to.equal(reward);
    });
  });
});
