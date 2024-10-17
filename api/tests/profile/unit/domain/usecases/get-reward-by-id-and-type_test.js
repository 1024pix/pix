import { getRewardByIdAndType } from '../../../../../src/profile/domain/usecases/get-reward-by-id-and-type.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Profile | Unit | UseCase | get-reward-by-id-and-type', function () {
  it('should return reward depending on the type provided', async function () {
    // given
    const rewardId = 1;
    const rewardType = 'attestations';
    const rewardSymbol = Symbol('reward');
    const rewardRepositoryStub = {
      getByIdAndType: sinon.stub().withArgs({ rewardId, rewardType }).resolves(rewardSymbol),
    };

    // when
    const result = await getRewardByIdAndType({ rewardId, rewardType, rewardRepository: rewardRepositoryStub });

    // then
    expect(result).to.equal(rewardSymbol);
  });
});
