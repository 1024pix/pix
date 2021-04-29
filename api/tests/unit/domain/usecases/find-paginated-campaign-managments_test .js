const { expect, sinon } = require('../../../test-helper');

const findPaginatedCampaignManagements = require('../../../../lib/domain/usecases/find-paginated-campaign-managements');

describe('Unit | Domain | Use Cases | find-paginated-campaign-managments', () => {

  describe('#findPaginatedCampaignManagement', () => {

    it('should return the campaigns of the given organization', async () => {
      const campaignManagementRepository = { findPaginatedCampaignManagements: sinon.stub() };

      // given
      const organizationId = 251;
      const campaignsManagementExpected = Symbol('campaign managment');
      const page = { number: 1, size: 3 };
      campaignManagementRepository.findPaginatedCampaignManagements.withArgs({ organizationId, page }).resolves(campaignsManagementExpected);

      // when
      const campaignManagements = await findPaginatedCampaignManagements({ organizationId, page, campaignManagementRepository });

      // then
      expect(campaignManagements).to.equals(campaignsManagementExpected);
    });
  });
});
