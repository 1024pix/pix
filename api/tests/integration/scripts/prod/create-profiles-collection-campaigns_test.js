import { expect, databaseBuilder, catchErr } from '../../../test-helper.js';
import { EntityValidationError } from '../../../../src/shared/domain/errors.js';
import { CampaignTypes } from '../../../../src/prescription/campaign/domain/read-models/CampaignTypes.js';
import { prepareCampaigns, checkData } from '../../../../scripts/prod/create-profiles-collection-campaigns.js';

describe('Integration | Scripts | create-profile-collection-campaigns', function () {
  describe('#prepareCampaigns', function () {
    let organizationId1;
    let organizationId2;
    beforeEach(function () {
      organizationId1 = databaseBuilder.factory.buildOrganization().id;
      organizationId2 = databaseBuilder.factory.buildOrganization().id;

      return databaseBuilder.commit();
    });

    it('should generate a code for the campaign model', async function () {
      // given
      const campaignData = {
        customLandingPageText: 'customLandingPageText',
        name: 'CampaignName',
        organizationId: organizationId1,
        creatorId: '789',
        multipleSendings: false,
      };

      // when
      const campaigns = await prepareCampaigns([campaignData]);

      // then
      const code = campaigns[0].code;
      expect(code).to.be.a('string');
      expect(code).to.have.lengthOf(9);
    });

    it('should be a profile collection type for the campaign model', async function () {
      // given
      const campaignData = {
        customLandingPageText: 'customLandingPageText',
        name: 'CampaignName',
        organizationId: organizationId1,
        creatorId: '789',
        multipleSendings: false,
      };

      // when
      const campaigns = await prepareCampaigns([campaignData]);

      // then
      expect(campaigns[0].type).to.equal(CampaignTypes.PROFILES_COLLECTION);
    });

    it('should create campaigns for each organizationId', async function () {
      // given
      const creatorId = '789';

      const campaignData1 = {
        name: 'Name1',
        organizationId: organizationId1,
        customLandingPageText: 'customLandingPageText1',
        creatorId,
        multipleSendings: false,
      };
      const campaignData2 = {
        name: 'Name2',
        organizationId: organizationId2,
        customLandingPageText: undefined,
        creatorId,
        multipleSendings: false,
      };

      // when
      const campaigns = await prepareCampaigns([campaignData1, campaignData2]);

      // then
      expect(campaigns).to.have.length(2);
      expect(campaigns[0].organizationId).to.equal(organizationId1);
      expect(campaigns[0].name).to.equal(campaignData1.name);
      expect(campaigns[0].customLandingPageText).to.equal(campaignData1.customLandingPageText);
      expect(campaigns[0].creatorId).to.equal(creatorId);

      expect(campaigns[1].organizationId).to.equal(organizationId2);
      expect(campaigns[1].name).to.equal(campaignData2.name);
      expect(campaigns[1].customLandingPageText).to.equal(undefined);
      expect(campaigns[1].creatorId).to.equal(creatorId);
    });

    it('should throw a validate error when campaign is not valid', async function () {
      // given
      const creatorId = '789';
      const campaignData = {
        name: '',
        organizationId: organizationId1,
        multipleSendings: false,
      };

      // when
      const error = await catchErr(prepareCampaigns)([campaignData], creatorId);

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
    });
  });

  describe('#checkData', function () {
    it('should create proper campaign attributes', function () {
      // given
      const name = 'SomeName';
      const organizationId = 3;
      const customLandingPageText = 'SomeLandingPageText';
      const creatorId = 123;
      const csvData = [{ name, organizationId, customLandingPageText, creatorId }];

      // when
      const checkedData = checkData(csvData);

      // then
      expect(checkedData[0]).to.deep.equal({
        organizationId,
        name,
        customLandingPageText,
        creatorId,
      });
    });

    it('should create proper campaign attributes even customLandingPageText is missing', async function () {
      // given
      const name = 'SomeName';
      const customLandingPageText = undefined;
      const organizationId = '123';
      const creatorId = '789';
      const csvData = [{ name, organizationId, customLandingPageText, creatorId }];

      // when
      const checkedData = checkData(csvData);

      // then
      expect(checkedData[0]).to.deep.equal({
        organizationId,
        name,
        customLandingPageText,
        creatorId,
      });
    });

    it('should throw an error if campaign organizationId is missing', async function () {
      // given
      const name = 'SomeName';
      const organizationId = '';
      const creatorId = '123';
      const csvData = [{ name, organizationId, creatorId }];

      // when
      const error = await catchErr(checkData)(csvData);

      // then
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.equal(
        "Ligne 1: L'organizationId est obligatoire pour la campagne de collecte de profils.",
      );
    });

    it('should throw an error if campaign creatorId is missing', async function () {
      // given
      const name = 'SomeName';
      const organizationId = '123';
      const creatorId = '';
      const csvData = [{ name, organizationId, creatorId }];

      // when
      const error = await catchErr(checkData)(csvData);

      // then
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.equal('Ligne 1: Le creatorId est obligatoire pour la campagne de collecte de profils.');
    });

    it('should throw an error if campaign name is missing', async function () {
      // given
      const name = undefined;
      const organizationId = '123';
      const creatorId = '789';
      const csvData = [{ name, organizationId, creatorId }];

      // when
      const error = await catchErr(checkData)(csvData);

      // then
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.equal(
        'Ligne 1: Le nom de campagne est obligatoire pour la campagne de collecte de profils.',
      );
    });
  });
});
