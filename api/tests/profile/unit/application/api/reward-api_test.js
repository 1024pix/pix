import { getByIdAndType } from '../../../../../src/profile/application/api/reward-api.js';
import { usecases } from '../../../../../src/profile/domain/usecases/index.js';
import { expect, sinon } from '../../../../test-helper.js';

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
});
