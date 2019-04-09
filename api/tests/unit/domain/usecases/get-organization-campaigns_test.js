const { expect, domainBuilder, sinon } = require('../../../test-helper');

const getOrganizationCampaigns = require('../../../../lib/domain/usecases/get-organization-campaigns');

describe('Unit | Domain | Use Cases | get-organization-campaigns', () => {

  const campaignRepository = { findByOrganizationIdWithCampaignReports: () => undefined };

  beforeEach(() => {
    campaignRepository.findByOrganizationIdWithCampaignReports = sinon.stub();
  });

  describe('#getOrganizationCampaigns', () => {

    it('should return the campaigns of the given organization', () => {
      // given
      const organizationId = 251;
      const foundCampaign = domainBuilder.buildCampaign({ organizationId });
      const foundCampaigns = [foundCampaign];
      campaignRepository.findByOrganizationIdWithCampaignReports.resolves(foundCampaigns);

      // when
      const promise = getOrganizationCampaigns({ organizationId, campaignRepository });

      // then
      return promise.then((campaigns) => {
        expect(campaigns).to.have.lengthOf(1);
        expect(campaigns).to.contains(foundCampaign);
      });
    });
  });
});
