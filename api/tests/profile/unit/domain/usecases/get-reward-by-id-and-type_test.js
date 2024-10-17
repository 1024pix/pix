import { getRewardByIdAndType } from '../../../../../src/profile/domain/usecases/get-reward-by-id-and-type.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Profile | Unit | UseCase | get-reward-by-id-and-type', function () {
  it('should return reward depending on the type provided', async function () {
    const rewardId = 1;
    const rewardType = 'attestations';
    const rewardSymbol = Symbol('reward');
    const rewardRepositoryStub = {
      getByIdAndType: sinon.stub().withArgs({ rewardId, rewardType }).resolves(rewardSymbol),
    };
    const result = await getRewardByIdAndType({ rewardId, rewardType, rewardRepository: rewardRepositoryStub });

    expect(result).to.equal(rewardSymbol);
  });
});
