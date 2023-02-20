import { expect, sinon } from '../../../test-helper';
import findPaginatedCampaignManagements from '../../../../lib/domain/usecases/find-paginated-campaign-managements';

describe('Unit | Domain | Use Cases | find-paginated-campaign-managments', function () {
  describe('#findPaginatedCampaignManagement', function () {
    it('should return the campaigns of the given organization', async function () {
      const campaignManagementRepository = { findPaginatedCampaignManagements: sinon.stub() };

      // given
      const organizationId = 251;
      const campaignsManagementExpected = Symbol('campaign managment');
      const page = { number: 1, size: 3 };
      campaignManagementRepository.findPaginatedCampaignManagements
        .withArgs({ organizationId, page })
        .resolves(campaignsManagementExpected);

      // when
      const campaignManagements = await findPaginatedCampaignManagements({
        organizationId,
        page,
        campaignManagementRepository,
      });

      // then
      expect(campaignManagements).to.equals(campaignsManagementExpected);
    });
  });
});
