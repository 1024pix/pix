import { createCampaigns } from '../../../../../lib/domain/usecases/campaigns-administration/create-campaigns.js';
import { domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | UseCase | campaign-administration | create-campaign', function () {
  it('should create campaigns', async function () {
    const campaignRepository = {
      save: sinon.stub(),
    };
    const code1 = Symbol('code1');
    const code2 = Symbol('code2');
    const administrator = domainBuilder.buildUser();
    const organization = domainBuilder.buildOrganization({ id: 3, externalId: '1237457A', ownerId: administrator.id });
    const administratorMembership = domainBuilder.buildMembership({
      user: administrator,
      organization,
      organizationRole: 'ADMIN',
    });
    const campaignCodeGeneratorStub = {
      generate: sinon.stub().withArgs(campaignRepository).onFirstCall().resolves(code1).onSecondCall().resolves(code2),
    };

    const campaignsToCreate = [
      {
        organizationId: organization.id,
        name: 'My Campaign',
        targetProfileId: 3,
        creatorId: 1,
      },
      {
        organizationId: organization.id,
        name: 'My Campaign',
        targetProfileId: 3,
        creatorId: 2,
      },
    ];

    const campaignsWithAllData = [
      {
        organizationId: organization.id,
        name: 'My Campaign',
        type: 'ASSESSMENT',
        targetProfileId: 3,
        ownerId: administrator.id,
        creatorId: 1,
        code: code1,
      },
      {
        organizationId: organization.id,
        name: 'My Campaign',
        type: 'ASSESSMENT',
        targetProfileId: 3,
        ownerId: administrator.id,
        creatorId: 2,
        code: code2,
      },
    ];

    campaignRepository.save.withArgs(campaignsWithAllData).resolves();

    const membershipRepository = {
      findAdminsByOrganizationId: sinon.stub(),
    };
    membershipRepository.findAdminsByOrganizationId
      .withArgs({ organizationId: organization.id })
      .resolves([administratorMembership]);

    await createCampaigns({
      campaignsToCreate,
      membershipRepository,
      campaignRepository,
      campaignCodeGenerator: campaignCodeGeneratorStub,
    });

    expect(campaignRepository.save).to.have.been.calledWith(campaignsWithAllData);
    expect(membershipRepository.findAdminsByOrganizationId).to.have.been.calledTwice;
  });
});
