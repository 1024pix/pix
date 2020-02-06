const { expect, domainBuilder, sinon } = require('../../../test-helper');

const findPaginatedFilteredOrganizationCampaigns = require('../../../../lib/domain/usecases/find-paginated-filtered-organization-campaigns');

describe('Unit | Domain | Use Cases | find-paginated-filtered-organization-campaigns', () => {

  const campaignRepository = { findPaginatedFilteredByOrganizationIdWithCampaignReports: () => undefined };

  beforeEach(() => {
    campaignRepository.findPaginatedFilteredByOrganizationIdWithCampaignReports = sinon.stub();
  });

  describe('#findPaginatedFilteredOrganizationCampaigns', () => {

    it('should return the campaigns of the given organization', () => {
      // given
      const organizationId = 251;
      const foundCampaign = domainBuilder.buildCampaign({ organizationId });
      const foundCampaigns = [foundCampaign];
      campaignRepository.findPaginatedFilteredByOrganizationIdWithCampaignReports.resolves(foundCampaigns);
      const page = { number: 1, size: 3 };

      // when
      const promise = findPaginatedFilteredOrganizationCampaigns({ organizationId, page, campaignRepository });

      // then
      return promise.then((campaigns) => {
        expect(campaigns).to.have.lengthOf(1);
        expect(campaigns).to.contains(foundCampaign);
      });
    });
  });
});
