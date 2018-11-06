const { expect, knex, factory, databaseBuilder } = require('../../../test-helper');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const Campaign = require('../../../../lib/domain/models/Campaign');

describe('Integration | Repository | Campaign', () => {

  describe('#isCodeAvailable', () => {

    beforeEach(async () => {
      const campaign = factory.buildCampaign({ code: 'BADOIT710' });
      databaseBuilder.factory.buildCampaign(campaign);
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should resolve true if the code is available', () => {
      // when
      const promise = campaignRepository.isCodeAvailable('FRANCE998');

      // then
      return promise.then((result) => {
        expect(result).to.be.true;
      });
    });

    it('should resolve false if the code is available', () => {
      // when
      const promise = campaignRepository.isCodeAvailable('BADOIT710');

      // then
      return promise.then((result) => {
        expect(result).to.be.false;
      });
    });

  });

  describe('#getByCode', () => {

    let campaignToInsert;
    beforeEach(async () => {
      campaignToInsert = factory.buildCampaign({ code: 'BADOIT710', createdAt: '2018-02-06 14:12:45' });
      databaseBuilder.factory.buildCampaign(campaignToInsert);
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should resolve the campaign relies to the code', () => {
      // when
      const promise = campaignRepository.getByCode('BADOIT710');

      // then
      return promise.then((result) => {
        expect(result).to.deep.equal(campaignToInsert);
      });
    });

    it('should resolve null if the code do not correspond to any campaign ', () => {
      // when
      const promise = campaignRepository.getByCode('BIDULEFAUX');

      // then
      return promise.then((result) => {
        expect(result).to.be.null;
      });
    });

  });

  describe('#save', () => {

    afterEach(() => {
      return knex('campaigns').delete();
    });

    it('should save the given campaign', () => {
      // given
      const campaignToSave = new Campaign({
        name: 'Evaluation niveau 1 recherche internet',
        code: 'BCTERD153',
        title: 'Parcours recherche internet',
        customLandingPageText: 'Parcours évaluatif concernant la recherche internet',
        creatorId: 6,
        organizationId: 44,
      });

      // when
      const promise = campaignRepository.save(campaignToSave);

      // then
      return promise.then((savedCampaign) => {
        expect(savedCampaign).to.be.instanceof(Campaign);
        expect(savedCampaign.id).to.exist;
        expect(savedCampaign.name).to.equal(campaignToSave.name);
        expect(savedCampaign.code).to.equal(campaignToSave.code);
        expect(savedCampaign.title).to.equal(campaignToSave.title);
        expect(savedCampaign.customLandingPageText).to.equal(campaignToSave.customLandingPageText);
        expect(savedCampaign.creatorId).to.equal(campaignToSave.creatorId);
        expect(savedCampaign.organizationId).to.equal(campaignToSave.organizationId);
      });
    });

  });

  describe('#findByOrganizationId', () => {

    const organizationId = 1;
    const campaign1Organization1 = factory.buildCampaign({
      id: 1,
      name: 'campaign1',
      code: 'AZERTY123',
      organizationId: organizationId,
      creatorId: 1
    });
    const campaign2Organization1 = factory.buildCampaign({
      id: 2,
      name: 'campaign2',
      code: 'AZERTY456',
      organizationId: organizationId,
      creatorId: 2
    });
    const campaign1Organization2 = factory.buildCampaign({
      id: 3,
      name: 'campaign3',
      code: 'AZERTY789',
      organizationId: 2,
      creatorId: 3
    });
    const campaigns = [campaign1Organization1, campaign2Organization1, campaign1Organization2];

    beforeEach(async () => {
      campaigns.forEach((campaign) => {
        databaseBuilder.factory.buildCampaign(campaign);
      });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return the campaigns of the given organization id', () => {
      // when
      const promise = campaignRepository.findByOrganizationId(organizationId);

      // then
      return promise.then((campaigns) => {
        expect(campaigns).to.have.lengthOf(2);

        expect(campaigns[0]).to.be.instanceof(Campaign);
        expect(campaigns[0].id).to.equal(campaign1Organization1.id);
        expect(campaigns[0].name).to.equal(campaign1Organization1.name);
        expect(campaigns[0].code).to.equal(campaign1Organization1.code);
        expect(campaigns[0].createdAt).to.exist;
        expect(campaigns[0].creatorId).to.equal(campaign1Organization1.creatorId);
        expect(campaigns[0].organizationId).to.equal(campaign1Organization1.organizationId);

        expect(campaigns[1].id).to.equal(campaign2Organization1.id);
      });
    });

  });
});
