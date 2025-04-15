import * as campaignApi from '../../../../../../src/prescription/campaign/application/api/campaigns-api.js';
import { UserNotAuthorizedToCreateCampaignError } from '../../../../../../src/prescription/campaign/domain/errors.js';
import { Campaign } from '../../../../../../src/prescription/campaign/domain/models/Campaign.js';
import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { CampaignReport } from '../../../../../../src/shared/domain/read-models/CampaignReport.js';
import { catchErr, expect, preventStubsToBeCalledUnexpectedly, sinon } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | API | Campaigns', function () {
  describe('#save', function () {
    it('should return code', async function () {
      const createdCampaign = domainBuilder.buildCampaign({ code: 'SOMETHING' });

      const createCampaignStub = sinon.stub(usecases, 'createCampaign');
      createCampaignStub
        .withArgs({
          campaign: {
            name: 'ABCDiag',
            title: 'Mon diagnostic Pix',
            customLandingPageText: 'Bienvenue',
            type: 'ASSESSMENT',
            targetProfileId: 1,
            creatorId: 2,
            ownerId: 2,
            organizationId: 1,
            multipleSendings: false,
          },
        })
        .resolves(createdCampaign);

      // when
      const result = await campaignApi.save({
        name: 'ABCDiag',
        title: 'Mon diagnostic Pix',
        targetProfileId: 1,
        organizationId: 1,
        creatorId: 2,
        customLandingPageText: 'Bienvenue',
      });

      // then
      expect(result.id).to.equal(createdCampaign.id);
      expect(result.code).to.equal(createdCampaign.code);
      expect(result).not.to.be.instanceOf(Campaign);
    });

    describe('When creator is not in organization or has no right to use target profile', function () {
      it('should throw an error', async function () {
        const createCampaignStub = sinon.stub(usecases, 'createCampaign');
        createCampaignStub
          .withArgs({
            campaign: {
              name: 'ABCDiag',
              title: 'Mon diagnostic Pix',
              customLandingPageText: 'Bienvenue',
              type: 'ASSESSMENT',
              targetProfileId: 1,
              creatorId: 2,
              ownerId: 2,
              organizationId: 1,
              multipleSendings: false,
            },
          })
          .rejects(new UserNotAuthorizedToCreateCampaignError());

        // when
        const error = await catchErr(campaignApi.save)({
          name: 'ABCDiag',
          title: 'Mon diagnostic Pix',
          targetProfileId: 1,
          organizationId: 1,
          creatorId: 2,
          customLandingPageText: 'Bienvenue',
        });

        // then
        expect(error).is.instanceOf(UserNotAuthorizedToCreateCampaignError);
      });
    });
  });

  describe('#get', function () {
    it('should return campaign informations', async function () {
      const campaignInformation = domainBuilder.buildCampaign({
        id: '777',
        code: 'SOMETHING',
        name: 'Godzilla',
        title: 'is Biohazard',
        customLandingPageText: 'Pika pika pikaCHUUUUUUUUUUUUUUUUUU',
        createdAt: new Date('2020-01-01'),
        archivedAt: new Date('2023-01-01'),
      });

      const getCampaignStub = sinon.stub(usecases, 'getCampaign');
      getCampaignStub.withArgs({ campaignId: campaignInformation.id }).resolves(campaignInformation);

      // when
      const result = await campaignApi.get(campaignInformation.id);

      // then
      expect(result.id).to.equal(campaignInformation.id);
      expect(result.code).to.equal(campaignInformation.code);
      expect(result.name).to.equal(campaignInformation.name);
      expect(result.title).to.equal(campaignInformation.title);
      expect(result.createdAt).to.equal(campaignInformation.createdAt);
      expect(result.archivedAt).to.equal(campaignInformation.archivedAt);
      expect(result.archivedAt).to.equal(campaignInformation.archivedAt);
      expect(result.customLandingPageText).to.equal(campaignInformation.customLandingPageText);
      expect(result).not.to.be.instanceOf(Campaign);
    });
  });

  describe('#getByCampaignParticipationId', function () {
    it('should return campaign informations', async function () {
      const campaignParticipationId = 123;
      const campaignInformation = domainBuilder.buildCampaign({
        id: '777',
        code: 'SOMETHING',
        name: 'Godzilla',
        title: 'is Biohazard',
        customLandingPageText: 'Pika pika pikaCHUUUUUUUUUUUUUUUUUU',
        createdAt: new Date('2020-01-01'),
        archivedAt: new Date('2023-01-01'),
      });

      const getCampaignOfCampaignParticipationStub = sinon.stub(usecases, 'getCampaignOfCampaignParticipation');
      getCampaignOfCampaignParticipationStub.withArgs({ campaignParticipationId: 123 }).resolves(campaignInformation);

      // when
      const result = await campaignApi.getByCampaignParticipationId(campaignParticipationId);

      // then
      expect(result.id).to.equal(campaignInformation.id);
      expect(result.code).to.equal(campaignInformation.code);
      expect(result.name).to.equal(campaignInformation.name);
      expect(result.title).to.equal(campaignInformation.title);
      expect(result.createdAt).to.equal(campaignInformation.createdAt);
      expect(result.archivedAt).to.equal(campaignInformation.archivedAt);
      expect(result.isExam).to.equal(campaignInformation.isExam);
      expect(result.isAssessment).to.equal(campaignInformation.isAssessment);
      expect(result.isProfilesCollection).to.equal(campaignInformation.isProfilesCollection);
      expect(result.customLandingPageText).to.equal(campaignInformation.customLandingPageText);
      expect(result).not.to.be.instanceOf(Campaign);
    });

    it('should return null when entities does not exist', async function () {
      const getCampaignOfCampaignParticipationStub = sinon.stub(usecases, 'getCampaignOfCampaignParticipation');
      getCampaignOfCampaignParticipationStub.withArgs({ campaignParticipationId: 456 }).resolves(null);

      const result = await campaignApi.getByCampaignParticipationId(456);

      expect(result).to.be.null;
    });
  });

  describe('#update', function () {
    it('should return campaign informations', async function () {
      const campaignInformation = domainBuilder.buildCampaign({
        id: '777',
        code: 'SOMETHING',
        name: 'Godzilla',
        title: 'is Biohazard',
        customLandingPageText: 'Pika pika pikaCHUUUUUUUUUUUUUUUUUU',
        createdAt: new Date('2020-01-01'),
        archivedAt: new Date('2023-01-01'),
      });

      const updateCampaignStub = sinon.stub(usecases, 'updateCampaign');
      updateCampaignStub
        .withArgs({
          campaignId: campaignInformation.id,
          name: campaignInformation.name,
          title: campaignInformation.title,
          customLandingPageText: campaignInformation.customLandingPageText,
        })
        .resolves(campaignInformation);

      // when
      const result = await campaignApi.update({
        campaignId: campaignInformation.id,
        name: campaignInformation.name,
        title: campaignInformation.title,
        customLandingPageText: campaignInformation.customLandingPageText,
      });

      // then
      expect(result).not.to.be.instanceOf(Campaign);
      expect(result.customLandingPageText).to.equal(campaignInformation.customLandingPageText);
    });
  });

  describe('#findCampaignSkillIdsForCampaignPartipicipations', function () {
    it('should return an array of campaign skill ids for campaign participations', async function () {
      const skillIds = Symbol('skillIds');
      const campaignParticipationIds = [123, 456];
      const usecaseStub = sinon.stub(usecases, 'findCampaignSkillIdsForCampaignParticipations');
      preventStubsToBeCalledUnexpectedly([usecaseStub]);
      usecaseStub.withArgs({ campaignParticipationIds }).resolves(skillIds);

      const result = await campaignApi.findCampaignSkillIdsForCampaignParticipations(campaignParticipationIds);

      expect(result).to.equal(skillIds);
    });
  });

  describe('#findAllForOrganization', function () {
    context('when withCoverRate is false or not filled in', function () {
      it('should return paginated campaign list from organizationId without cover rate', async function () {
        const organizationId = Symbol('organizationId');
        const page = Symbol('page');
        const meta = Symbol('meta');
        const targetProfileName = Symbol('targetProfileName');

        const campaignInformation1 = domainBuilder.buildCampaignReport({
          id: 777,
          code: 'SOMETHING',
          name: 'Godzilla',
          title: 'is Biohazard',
          customLandingPageText: 'Rooooooooooooar',
          createdAt: new Date('2020-01-01'),
          archivedAt: new Date('2023-01-01'),
          targetProfileName,
        });

        const getCampaignStub = sinon.stub(usecases, 'findPaginatedFilteredOrganizationCampaigns');
        getCampaignStub
          .withArgs({ organizationId, page, withCoverRate: false })
          .resolves({ models: [campaignInformation1], meta });

        // when
        const result = await campaignApi.findAllForOrganization({ organizationId, page });

        // then
        const firstCampaignListItem = result.models[0];
        expect(result.meta).to.be.equal(meta);
        expect(firstCampaignListItem).not.to.be.instanceOf(CampaignReport);
        expect(firstCampaignListItem.id).to.be.equal(campaignInformation1.id);
        expect(firstCampaignListItem.name).to.be.equal(campaignInformation1.name);
        expect(firstCampaignListItem.createdAt).to.be.equal(campaignInformation1.createdAt);
        expect(firstCampaignListItem.archivedAt).to.be.equal(campaignInformation1.archivedAt);
        expect(firstCampaignListItem.targetProfileName).to.be.equal(targetProfileName);
        expect(firstCampaignListItem.tubes).to.be.undefined;
      });
    });
    context('when withCoverRate is true', function () {
      it('should return paginated campaign list from organizationId with cover rate', async function () {
        const organizationId = Symbol('organizationId');
        const page = Symbol('page');
        const meta = Symbol('meta');
        const targetProfileName = Symbol('targetProfileName');
        const coverRate = domainBuilder.prescription.campaign.buildCampaignResultLevelsPerTubesAndCompetences();

        const campaignInformation1 = domainBuilder.buildCampaignReport({
          id: 777,
          code: 'SOMETHING',
          name: 'Godzilla',
          title: 'is Biohazard',
          customLandingPageText: 'Rooooooooooooar',
          createdAt: new Date('2020-01-01'),
          archivedAt: new Date('2023-01-01'),
          targetProfileName,
        });

        campaignInformation1.setCoverRate(coverRate);

        const getCampaignStub = sinon.stub(usecases, 'findPaginatedFilteredOrganizationCampaigns');
        getCampaignStub
          .withArgs({ organizationId, page, withCoverRate: true })
          .resolves({ models: [campaignInformation1], meta });

        // when
        const result = await campaignApi.findAllForOrganization({ organizationId, page, withCoverRate: true });

        // then
        const firstCampaignListItem = result.models[0];
        expect(result.meta).to.be.equal(meta);
        expect(firstCampaignListItem).not.to.be.instanceOf(CampaignReport);
        expect(firstCampaignListItem.id).to.be.equal(campaignInformation1.id);
        expect(firstCampaignListItem.name).to.be.equal(campaignInformation1.name);
        expect(firstCampaignListItem.createdAt).to.be.equal(campaignInformation1.createdAt);
        expect(firstCampaignListItem.archivedAt).to.be.equal(campaignInformation1.archivedAt);
        expect(firstCampaignListItem.targetProfileName).to.be.equal(targetProfileName);
        expect(firstCampaignListItem.tubes).to.be.equal(coverRate.levelsPerTube);
      });
    });
  });
});
