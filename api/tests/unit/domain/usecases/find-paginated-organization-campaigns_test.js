const { expect, domainBuilder, sinon } = require('../../../test-helper');

const findPaginatedOrganizationCampaigns = require('../../../../lib/domain/usecases/find-paginated-organization-campaigns');

describe('Unit | Domain | Use Cases | find-paginated-organization-campaigns', () => {

  const campaignRepository = { findPaginatedByOrganizationIdWithCampaignReports: () => undefined };

  beforeEach(() => {
    campaignRepository.findPaginatedByOrganizationIdWithCampaignReports = sinon.stub();
  });

  describe('#findPaginatedOrganizationCampaigns', () => {

    it('should return the campaigns of the given organization', () => {
      // given
      const organizationId = 251;
      const foundCampaign = domainBuilder.buildCampaign({ organizationId });
      const foundCampaigns = [foundCampaign];
      campaignRepository.findPaginatedByOrganizationIdWithCampaignReports.resolves(foundCampaigns);
      const page = { number: 1, size: 3 };

      // when
      const promise = findPaginatedOrganizationCampaigns({ organizationId, page, campaignRepository });

      // then
      return promise.then((campaigns) => {
        expect(campaigns).to.have.lengthOf(1);
        expect(campaigns).to.contains(foundCampaign);
      });
    });
  });
});
