import { domainBuilder, expect, sinon } from '../../../../test-helper.js';
import { createCampaigns } from '../../../../../lib/domain/usecases/campaigns-administration/create-campaigns.js';

describe('Unit | UseCase | campaign-administration | create-campaign', function () {
  it('should create campaigns', async function () {
    const campaignAdministrationRepository = {
      createCampaigns: sinon.stub(),
    };
    const creatorId = Symbol('creatorId');
    const code = Symbol('code');
    const administrator = domainBuilder.buildUser();
    const organization = domainBuilder.buildOrganization({ id: 3, externalId: '1237457A', ownerId: administrator.id });
    const membership = domainBuilder.buildMembership({
      user: administrator,
      organization,
      organizationRole: 'ADMIN',
    });
    const campaignRepository = Symbol('campaignRepository');
    const campaignCodeGeneratorStub = {
      generate: sinon.stub().withArgs(campaignRepository).resolves(code),
    };

    const campaignsToCreate = [
      {
        organizationId: organization.id,
        name: 'My Campaign',
        targetProfileId: 3,
      },
    ];

    const campaignsWithAllData = [
      {
        organizationId: organization.id,
        name: 'My Campaign',
        targetProfileId: 3,
        ownerId: administrator.id,
        creatorId,
        code,
      },
    ];

    campaignAdministrationRepository.createCampaigns.withArgs(campaignsWithAllData).resolves();

    const membershipRepository = {
      findAdminsByOrganizationId: sinon.stub(),
    };
    membershipRepository.findAdminsByOrganizationId.withArgs(organization.id).resolves([membership]);

    await createCampaigns({
      campaignsToCreate,
      creatorId,
      campaignAdministrationRepository,
      membershipRepository,
      campaignRepository,
      campaignCodeGenerator: campaignCodeGeneratorStub,
    });

    expect(campaignAdministrationRepository.createCampaigns).to.have.been.calledWith(campaignsWithAllData);
  });
});
