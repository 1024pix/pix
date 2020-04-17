const { expect, sinon, domainBuilder } = require('../../../test-helper');
const useCase = require('../../../../lib/application/usecases/checkUserCanAccessCampaign');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');

describe('Unit | Application | Use Case | CheckUserCanAccessCampaign', () => {

  beforeEach(() => {
    sinon.stub(userRepository, 'getWithMemberships');
    sinon.stub(campaignRepository, 'get');
  });

  context('When user can access campaign', () => {

    it('should return true', async () => {
      // given
      const organization = domainBuilder.buildOrganization();
      const campaign = domainBuilder.buildCampaign({ organizationId: organization.id });
      const membership = domainBuilder.buildMembership({ organization });
      const user = domainBuilder.buildUser({ memberships: [membership] });
      userRepository.getWithMemberships.resolves(user);
      campaignRepository.get.resolves(campaign);

      // when
      const response = await useCase.execute(user.id, campaign.id);

      // then
      expect(response).to.equal(true);
    });
  });

  context('When user belongs to campaign\'s organization', () => {

    it('should return false', async () => {
      // given
      const organization = domainBuilder.buildOrganization();
      const campaign = domainBuilder.buildCampaign({ organizationId: organization.id });
      const otherOrganization = domainBuilder.buildOrganization();
      const membership = domainBuilder.buildMembership({ organization: otherOrganization });
      const user = domainBuilder.buildUser({ memberships: [membership] });
      userRepository.getWithMemberships.resolves(user);
      campaignRepository.get.resolves(campaign);

      // when
      const response = await useCase.execute(user.id, campaign.id);

      // then
      expect(response).to.equal(false);
    });
  });
});
