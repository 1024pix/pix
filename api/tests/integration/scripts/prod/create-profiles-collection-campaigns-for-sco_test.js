const { expect, databaseBuilder, catchErr } = require('../../../test-helper');
const { EntityValidationError } = require('../../../../lib/domain/errors');

const Campaign = require('../../../../lib/domain/models/Campaign');

const {
  prepareCampaigns,
  checkData,
} = require('../../../../scripts/prod/create-profiles-collection-campaigns-for-sco');

describe('Integration | Scripts | create-profile-collection-campaigns', () => {

  describe('#prepareCampaigns', () => {

    let organizationId1;
    let organizationId2;
    beforeEach(() => {
      organizationId1 = databaseBuilder.factory.buildOrganization().id;
      organizationId2 = databaseBuilder.factory.buildOrganization().id;

      return databaseBuilder.commit();
    });

    it('should generate a code for the campaign model', async () => {
      // given
      const creatorId = '789';
      const campaignData = {
        customLandingPageText: 'customLandingPageText',
        name: 'CampaignName',
        organizationId: organizationId1,
      };

      // when
      const campaigns = await prepareCampaigns([campaignData], creatorId);

      // then
      expect(typeof campaigns[0].code === 'string').to.be.true;
      expect(campaigns[0].code.length).to.equal(9);
    });

    it('should be a profile collection type for the campaign model', async () => {
      // given
      const creatorId = '789';
      const campaignData = {
        customLandingPageText: 'customLandingPageText',
        name: 'CampaignName',
        organizationId: organizationId1,
      };

      // when
      const campaigns = await prepareCampaigns([campaignData], creatorId);

      // then
      expect(campaigns[0].type).to.equal(Campaign.types.PROFILES_COLLECTION);
    });

    it('should create campaigns for each organizationId', async () => {
      // given
      const creatorId = '789';

      const campaignData1 = {
        name: 'Name1',
        organizationId: organizationId1,
        customLandingPageText: 'customLandingPageText1',
      };
      const campaignData2 = {
        name: 'Name2',
        organizationId: organizationId2,
        customLandingPageText: undefined,
      };

      // when
      const campaigns = await prepareCampaigns([campaignData1, campaignData2], creatorId);

      // then
      expect(campaigns).to.have.length(2);
      expect(campaigns[0].organizationId).to.equal(organizationId1);
      expect(campaigns[0].name).to.equal(campaignData1.name);
      expect(campaigns[0].customLandingPageText).to.equal(campaignData1.customLandingPageText);
      expect(campaigns[0].creatorId).to.equal(creatorId);

      expect(campaigns[1].organizationId).to.equal(organizationId2);
      expect(campaigns[1].name).to.equal(campaignData2.name);
      expect(campaigns[1].customLandingPageText).to.equal('');
      expect(campaigns[1].creatorId).to.equal(creatorId);
    });

    it('should throw a validate error when campaign is not valid', async () => {
      // given
      const creatorId = '789';
      const campaignData = {
        name: '',
        organizationId: organizationId1,
      };

      // when
      const error = await catchErr(prepareCampaigns)([campaignData], creatorId);

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
    });
  });

  describe('#checkData', () => {
    it('should create proper campaign attributes', () => {
      // given
      const name = 'SomeName';
      const organizationId = 3;
      const customLandingPageText = 'SomeLandingPageText';
      const csvData = [{ name, organizationId, customLandingPageText }];

      // when
      const checkedData = checkData(csvData);

      // then
      expect(checkedData[0]).to.deep.equal({
        organizationId,
        name,
        customLandingPageText,
      });
    });

    it('should create proper campaign attributes even customLandingPageText is missing', async () => {
      // given
      const name = 'SomeName';
      const customLandingPageText = undefined;
      const organizationId = '123';
      const csvData = [{ name, organizationId, customLandingPageText }];

      // when
      const checkedData = checkData(csvData);

      // then
      expect(checkedData[0]).to.deep.equal({
        organizationId,
        name,
        customLandingPageText,
      });
    });

    it('should throw an error if campaign organizationId is missing', async () => {
      // given
      const name = 'SomeName';
      const organizationId = '';
      const csvData = [{ name, organizationId }];

      // when
      const error = await catchErr(checkData)(csvData);

      // then
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.equal('Ligne 1: Une organizationId est obligatoire pour la campagne de collecte de profile.');
    });

    it('should throw an error if campaign name is missing', async () => {
      // given
      const name = undefined;
      const organizationId = '123';
      const csvData = [{ name, organizationId }];

      // when
      const error = await catchErr(checkData)(csvData);

      // then
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.equal('Ligne 1: Un nom de campagne est obligatoire pour la campagne de collecte de profile.');
    });
  });
});
