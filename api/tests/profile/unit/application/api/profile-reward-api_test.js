import { expect } from 'chai';
import sinon from 'sinon';

import { findByUserIdAndRewardId } from '../../../../../src/profile/application/api/profile-reward-api.js';
import { ProfileReward } from '../../../../../src/profile/domain/models/ProfileReward.js';
import { usecases } from '../../../../../src/profile/domain/usecases/index.js';
import { REWARD_TYPES } from '../../../../../src/quest/domain/constants.js';

describe('Profile | Unit | Application | Api | attestations', function () {
  describe('#findByUserIdAndRewardId', function () {
    it('should return a profile reward for a given user id and reward id', async function () {
      //given
      sinon.stub(usecases, 'findByUserIdAndRewardId');
      const profileReward = new ProfileReward({
        id: 1,
        userId: 1,
        rewardId: 2,
        rewardType: REWARD_TYPES.ATTESTATION,
      });

      usecases.findByUserIdAndRewardId.withArgs({ userId: 1, rewardId: 2 }).resolves(profileReward);

      const result = await findByUserIdAndRewardId({ userId: 1, rewardId: 2 });
      expect(result).to.equal(profileReward);
    });
  });
});
