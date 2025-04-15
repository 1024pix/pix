import { getTargetProfile } from '../../../../../../src/prescription/campaign/domain/usecases/get-target-profile.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | get-target-profile', function () {
  it('should get target profile from campaignId', async function () {
    // given
    const targetProfileRepository = {
      getByCampaignId: sinon.stub(),
    };
    const campaignId = 123;
    const targetProfile = Symbol('targetProfile');
    targetProfileRepository.getByCampaignId.withArgs({ campaignId }).resolves(targetProfile);

    // when
    const result = await getTargetProfile({
      campaignId,
      targetProfileRepository,
    });

    // then
    expect(result).to.deep.equal(targetProfile);
  });
});
