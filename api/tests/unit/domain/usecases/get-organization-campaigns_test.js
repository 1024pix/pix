const { expect, factory, sinon } = require('../../../test-helper');

const useCase = require('../../../../lib/domain/usecases/');

describe('Unit | Domain | Use Cases | get-organization-campaigns', () => {

  const campaignRepository = { findByOrganization: () => undefined };

  beforeEach(() => {
    sinon.stub(campaignRepository, 'findByOrganization');
  });

  afterEach(() => {
    campaignRepository.findByOrganization.restore();
  });

  describe('#getOrganizationCampaigns', () => {

    it('should return the campaigns of the given organization', () => {
      // given
      const organizationId = 251;
      const foundCampaign = factory.buildCampaign({ organizationId });
      const foundCampaigns = [foundCampaign];
      campaignRepository.findByOrganization.resolves(foundCampaigns);

      // when
      const promise = useCase.getOrganizationCampaigns({ organizationId, campaignRepository });

      // then
      return promise.then((campaigns) => {
        expect(campaigns).to.have.lengthOf(1);
        expect(campaigns).to.contains(foundCampaign);
      });
    });

  });
});
