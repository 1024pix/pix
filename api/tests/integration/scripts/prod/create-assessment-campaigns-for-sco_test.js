import { expect, databaseBuilder, catchErr } from '../../../test-helper';
import { EntityValidationError } from '../../../../lib/domain/errors';
import {
  prepareCampaigns,
  checkData,
  getByExternalIdFetchingIdOnly,
} from '../../../../scripts/prod/create-assessment-campaigns-for-sco';

describe('Integration | Scripts | create-assessment-campaigns', function () {
  describe('#prepareCampaigns', function () {
    const externalId = '456A';
    let organizationId;
    beforeEach(function () {
      organizationId = databaseBuilder.factory.buildOrganization({ externalId }).id;
      return databaseBuilder.commit();
    });

    it('should generate a code for the campaign model', async function () {
      // given
      const creatorId = '789';
      const targetProfileId = '123';
      const campaignData = {
        targetProfileId,
        name: 'CampaignName',
        externalId,
        creatorId,
        multipleSendings: false,
      };

      // when
      const campaigns = await prepareCampaigns([campaignData]);

      // then
      const code = campaigns[0].code;
      expect(code).to.be.a('string');
      expect(code).to.have.lengthOf(9);
    });

    it('should create campaigns for each target profile', async function () {
      // given
      const creatorId = '789';
      const targetProfileId1 = '123';
      const targetProfileId2 = '321';

      const campaignData1 = {
        targetProfileId: targetProfileId1,
        name: 'Name1',
        externalId,
        title: 'title1',
        customLandingPageText: 'customLandingPageText1',
        creatorId,
        multipleSendings: false,
      };
      const campaignData2 = {
        targetProfileId: targetProfileId2,
        name: 'Name2',
        externalId,
        title: 'title2',
        customLandingPageText: 'customLandingPageText2',
        creatorId,
        multipleSendings: false,
      };

      // when
      const campaigns = await prepareCampaigns([campaignData1, campaignData2]);

      // then
      expect(campaigns).to.have.length(2);
      expect(campaigns[0].organizationId).to.equal(organizationId);
      expect(campaigns[0].targetProfileId).to.equal(campaignData1.targetProfileId);
      expect(campaigns[0].name).to.equal(campaignData1.name);
      expect(campaigns[0].title).to.equal(campaignData1.title);
      expect(campaigns[0].customLandingPageText).to.equal(campaignData1.customLandingPageText);

      expect(campaigns[1].organizationId).to.equal(organizationId);
      expect(campaigns[1].targetProfileId).to.equal(campaignData2.targetProfileId);
      expect(campaigns[1].name).to.equal(campaignData2.name);
      expect(campaigns[1].title).to.equal(campaignData2.title);
      expect(campaigns[1].customLandingPageText).to.equal(campaignData2.customLandingPageText);
    });

    it('should throw a validate error when campaign is not valid', async function () {
      // given
      const campaignData = {
        targetProfileId: 'foireux',
        externalId,
        multipleSendings: false,
      };

      // when
      const error = await catchErr(prepareCampaigns)([campaignData]);

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
    });
  });

  describe('#checkData', function () {
    it('should create proper campaign attributes', function () {
      // given
      const targetProfileId = '123';
      const name = 'SomeName';
      const externalId = '456';
      const title = 'SomeTitle';
      const customLandingPageText = 'SomeLandingPageText';
      const creatorId = '789';
      const csvData = [{ targetProfileId, name, externalId, title, customLandingPageText, creatorId }];

      // when
      const checkedData = checkData(csvData);

      // then
      expect(checkedData[0]).to.deep.equal({
        targetProfileId,
        name,
        externalId,
        title,
        customLandingPageText,
        creatorId,
      });
    });

    it('replace title and customLandingPageText when there has empty', function () {
      // given
      const targetProfileId = '123';
      const name = 'SomeName';
      const externalId = '456';
      const title = '';
      const customLandingPageText = '';
      const creatorId = '789';
      const csvData = [{ targetProfileId, name, externalId, title, customLandingPageText, creatorId }];

      // when
      const checkedData = checkData(csvData);

      // then
      expect(checkedData[0]).to.deep.equal({
        targetProfileId,
        name,
        externalId,
        title: null,
        customLandingPageText: null,
        creatorId,
      });
    });

    it('should throw an error if targetProfileId is missing', async function () {
      // given
      const targetProfileId = undefined;
      const name = 'SomeName';
      const externalId = '123';
      const creatorId = '789';
      const csvData = [{ targetProfileId, name, externalId, creatorId }];

      // when
      const error = await catchErr(checkData)(csvData);

      // then
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.equal('Un targetProfileId est manquant pour la campagne SomeName.');
    });

    it('should throw an error if campaign name is missing', async function () {
      // given
      const targetProfileId = '123';
      const name = undefined;
      const externalId = '123';
      const creatorId = '789';
      const csvData = [{ targetProfileId, name, externalId, creatorId }];

      // when
      const error = await catchErr(checkData)(csvData);

      // then
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.equal('Un nom de campagne est manquant pour le profil cible 123.');
    });

    it('should throw an error if externalId is missing', async function () {
      // given
      const targetProfileId = '123';
      const name = 'SomeName';
      const externalId = undefined;
      const creatorId = '789';
      const csvData = [{ targetProfileId, name, externalId, creatorId }];

      // when
      const error = await catchErr(checkData)(csvData);

      // then
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.equal('Un externalId est manquant pour le profil cible 123.');
    });

    it('should throw an error if creatorId is missing', async function () {
      // given
      const targetProfileId = '123';
      const name = 'SomeName';
      const externalId = '123';
      const creatorId = undefined;
      const csvData = [{ targetProfileId, name, externalId, creatorId }];

      // when
      const error = await catchErr(checkData)(csvData);

      // then
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.equal('Un creatorId est manquant pour le profil cible 123.');
    });
  });

  describe('#getByExternalIdFetchingIdOnly', function () {
    let organization;

    beforeEach(async function () {
      organization = databaseBuilder.factory.buildOrganization({ externalId: '1234568' });
      databaseBuilder.factory.buildOrganization({ externalId: '9764321' });

      await databaseBuilder.commit();
    });

    it('should return the organization based on the externalId', async function () {
      // given
      const externalId = '1234568';

      // when
      const foundOrganization = await getByExternalIdFetchingIdOnly(externalId);

      // then
      expect(foundOrganization.externalId).to.equal(organization.externalId);
    });

    it('should throw a not found error when externalId is not present in database', async function () {
      // given
      const externalId = '999';

      // when
      const error = await catchErr(getByExternalIdFetchingIdOnly)(externalId);

      // then
      expect(error).to.be.instanceOf(Error);
    });
  });
});
