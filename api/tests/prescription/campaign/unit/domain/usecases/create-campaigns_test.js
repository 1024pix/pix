import { createCampaigns } from '../../../../../../src/prescription/campaign/domain/usecases/create-campaigns.js';
import { CampaignTypes } from '../../../../../../src/prescription/shared/domain/constants.js';
import { NotFoundError, UserNotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | campaign-administration | create-campaigns', function () {
  let codeGeneratorStub;
  let campaignsToCreate;
  let campaignAdministrationRepositoryStub;
  let campaignCreatorRepositoryStub;
  let userRepositoryStub;
  let organizationRepositoryStub;
  let createdCampaignsSymbol;

  beforeEach(function () {
    campaignAdministrationRepositoryStub = {
      save: sinon.stub(),
    };
    userRepositoryStub = {
      get: sinon.stub(),
    };
    organizationRepositoryStub = {
      get: sinon.stub(),
    };
    const code1 = Symbol('code1');
    const code2 = Symbol('code2');
    const someoneId = 454756;
    const otherOrganization = domainBuilder.buildOrganization({ id: 3 });
    const organization = domainBuilder.buildOrganization({ id: 4 });

    codeGeneratorStub = {
      generate: sinon
        .stub()
        .withArgs(campaignAdministrationRepositoryStub)
        .onFirstCall()
        .resolves(code1)
        .onSecondCall()
        .resolves(code2),
    };

    campaignsToCreate = [
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
        ownerId: someoneId,
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
      .withArgs({ ...campaignsToCreate[1], type: CampaignTypes.ASSESSMENT, code: code2, ownerId: someoneId })
      .resolves(campaignsWithAllData[1]);

    campaignCreatorRepositoryStub = {
      get: sinon.stub(),
    };

    campaignCreatorRepositoryStub.get.withArgs(campaignsToCreate[0].organizationId).resolves(campaignCreatorPOJO);
    campaignCreatorRepositoryStub.get.withArgs(campaignsToCreate[1].organizationId).resolves(campaignCreatorPOJO);

    createdCampaignsSymbol = Symbol('');
    campaignAdministrationRepositoryStub.save.withArgs(campaignsWithAllData).resolves(createdCampaignsSymbol);
  });

  describe('success case', function () {
    it('should create campaigns', async function () {
      organizationRepositoryStub.get.withArgs(campaignsToCreate[0].organizationId).resolves();
      userRepositoryStub.get.withArgs(campaignsToCreate[0].ownerId).resolves();
      organizationRepositoryStub.get.withArgs(campaignsToCreate[1].organizationId).resolves();
      userRepositoryStub.get.withArgs(campaignsToCreate[1].ownerId).resolves();

      const result = await createCampaigns({
        campaignsToCreate,
        campaignAdministrationRepository: campaignAdministrationRepositoryStub,
        codeGenerator: codeGeneratorStub,
        campaignCreatorRepository: campaignCreatorRepositoryStub,
        userRepository: userRepositoryStub,
        organizationRepository: organizationRepositoryStub,
      });

      expect(result).to.equal(createdCampaignsSymbol);
    });
  });

  describe('errors case', function () {
    it('should throw error if ownerId does not exist', async function () {
      organizationRepositoryStub.get.withArgs(campaignsToCreate[0].organizationId).resolves();
      userRepositoryStub.get.withArgs(campaignsToCreate[0].ownerId).rejects(new UserNotFoundError());

      const error = await catchErr(createCampaigns)({
        campaignsToCreate,
        campaignAdministrationRepository: campaignAdministrationRepositoryStub,
        codeGenerator: codeGeneratorStub,
        campaignCreatorRepository: campaignCreatorRepositoryStub,
        userRepository: userRepositoryStub,
        organizationRepository: organizationRepositoryStub,
      });

      expect(error).to.be.an.instanceof(UserNotFoundError);
    });

    it('should throw error if organization does not exist', async function () {
      organizationRepositoryStub.get.withArgs(campaignsToCreate[0].organizationId).rejects(new NotFoundError());
      userRepositoryStub.get.withArgs(campaignsToCreate[0].ownerId).resolves();

      const error = await catchErr(createCampaigns)({
        campaignsToCreate,
        campaignAdministrationRepository: campaignAdministrationRepositoryStub,
        codeGenerator: codeGeneratorStub,
        campaignCreatorRepository: campaignCreatorRepositoryStub,
        userRepository: userRepositoryStub,
        organizationRepository: organizationRepositoryStub,
      });

      expect(error).to.be.an.instanceof(NotFoundError);
    });
  });
});
