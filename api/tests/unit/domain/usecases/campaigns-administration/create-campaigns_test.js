import { domainBuilder, expect, sinon } from '../../../../test-helper.js';
import { createCampaigns } from '../../../../../lib/domain/usecases/campaigns-administration/create-campaigns.js';
import { CampaignTypes } from '../../../../../lib/domain/models/CampaignTypes.js';

describe('Unit | UseCase | campaign-administration | create-campaign', function () {
  it('should create campaigns', async function () {
    const campaignRepository = {
      save: sinon.stub(),
    };
    const code1 = Symbol('code1');
    const code2 = Symbol('code2');
    const administrator = domainBuilder.buildUser();
    const someoneId = 454756;
    const otherOrganization = domainBuilder.buildOrganization({ id: 3 });
    const organization = domainBuilder.buildOrganization({ id: 4 });
    const administratorMembership = domainBuilder.buildMembership({
      user: administrator,
      organization: otherOrganization,
      organizationRole: 'ADMIN',
    });

    const codeGeneratorStub = {
      generate: sinon.stub().withArgs(campaignRepository).onFirstCall().resolves(code1).onSecondCall().resolves(code2),
    };

    const campaignsToCreate = [
      {
        organizationId: organization.id,
        name: 'My Campaign',
        targetProfileId: 3,
        creatorId: 2,
        ownerId: someoneId,
      },
      {
        organizationId: otherOrganization.id,
        name: 'My other Campaign',
        targetProfileId: 3,
        creatorId: 1,
      },
    ];

    const campaignsWithAllData = [
      {
        ...campaignsToCreate[0],
        type: 'ASSESSMENT',
        code: code1,
      },
      {
        ...campaignsToCreate[1],
        type: 'ASSESSMENT',
        ownerId: administrator.id,
        code: code2,
      },
    ];

    const campaignCreatorPOJO = {
      createCampaign: sinon.stub(),
    };

    campaignCreatorPOJO.createCampaign
      .withArgs({ ...campaignsToCreate[0], type: CampaignTypes.ASSESSMENT, code: code1, ownerId: someoneId })
      .resolves(campaignsWithAllData[0]);
    campaignCreatorPOJO.createCampaign
      .withArgs({ ...campaignsToCreate[1], type: CampaignTypes.ASSESSMENT, code: code2, ownerId: administrator.id })
      .resolves(campaignsWithAllData[1]);

    const campaignCreatorRepositoryStub = {
      get: sinon.stub(),
    };

    campaignCreatorRepositoryStub.get
      .withArgs({
        userId: campaignsToCreate[0].creatorId,
        organizationId: campaignsToCreate[0].organizationId,
        shouldOwnerBeFromOrganization: false,
      })
      .resolves(campaignCreatorPOJO);
    campaignCreatorRepositoryStub.get
      .withArgs({
        userId: campaignsToCreate[1].creatorId,
        organizationId: campaignsToCreate[1].organizationId,
        shouldOwnerBeFromOrganization: false,
      })
      .resolves(campaignCreatorPOJO);

    const createdCampaignsSymbol = Symbol('');
    campaignRepository.save.withArgs(campaignsWithAllData).resolves(createdCampaignsSymbol);

    const membershipRepository = {
      findAdminsByOrganizationId: sinon.stub(),
    };
    membershipRepository.findAdminsByOrganizationId
      .withArgs({ organizationId: otherOrganization.id })
      .resolves([administratorMembership]);

    const result = await createCampaigns({
      campaignsToCreate,
      membershipRepository,
      campaignRepository,
      codeGenerator: codeGeneratorStub,
      campaignCreatorRepository: campaignCreatorRepositoryStub,
    });

    expect(result).to.equal(createdCampaignsSymbol);
  });
});
