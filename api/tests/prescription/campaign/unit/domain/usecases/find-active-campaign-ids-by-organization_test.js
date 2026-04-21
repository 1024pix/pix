import sinon from 'sinon';

import { findActiveCampaignIdsByOrganization } from '../../../../../../src/prescription/campaign/domain/usecases/find-active-campaign-ids-by-organization.js';

describe('Unit | Domain | Use Cases | find-active-campaign-ids-by-organization', function () {
  it('should return active campaign IDs for the organization', async function () {
    // given
    const organizationId = 123;
    const expectedCampaignIds = [1, 2, 3];
    const campaignManagementRepository = {
      findActiveCampaignIdsByOrganization: sinon.stub().resolves(expectedCampaignIds),
    };

    // when
    const result = await findActiveCampaignIdsByOrganization({
      organizationId,
      campaignManagementRepository,
    });

    // then
    expect(campaignManagementRepository.findActiveCampaignIdsByOrganization).to.have.been.calledOnceWithExactly({
      organizationId,
    });
    expect(result).to.deep.equal(expectedCampaignIds);
  });
});
