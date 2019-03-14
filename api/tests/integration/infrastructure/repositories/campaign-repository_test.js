const { expect, knex, domainBuilder, databaseBuilder } = require('../../../test-helper');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const Campaign = require('../../../../lib/domain/models/Campaign');
const BookshelfCampaign = require('../../../../lib/infrastructure/data/campaign');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | Campaign', () => {

  describe('#isCodeAvailable', () => {

    beforeEach(async () => {
      const campaign = domainBuilder.buildCampaign({ code: 'BADOIT710' });
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
      campaignToInsert = domainBuilder.buildCampaign({ code: 'BADOIT710', createdAt: new Date('2018-02-06T14:12:45Z') });
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
        expect(result.id).to.equal(campaignToInsert.id);
        expect(result.name).to.equal(campaignToInsert.name);
        expect(result.code).to.equal(campaignToInsert.code);
        expect(result.organizationId).to.equal(campaignToInsert.organizationId);
        expect(result.creatorId).to.equal(campaignToInsert.creatorId);
        expect(result.createdAt).to.deep.equal(campaignToInsert.createdAt);
        expect(result.targetProfileId).to.equal(campaignToInsert.targetProfileId);
        expect(result.customLandingPageText).to.equal(campaignToInsert.customLandingPageText);
        expect(result.idPixLabel).to.equal(campaignToInsert.idPixLabel);
        expect(result.title).to.equal(campaignToInsert.title);
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
    const campaign1Organization1 = domainBuilder.buildCampaign({
      id: 1,
      name: 'campaign1',
      code: 'AZERTY123',
      organizationId: organizationId,
      creatorId: 1
    });
    const campaign2Organization1 = domainBuilder.buildCampaign({
      id: 2,
      name: 'campaign2',
      code: 'AZERTY456',
      organizationId: organizationId,
      creatorId: 2
    });
    const campaign1Organization2 = domainBuilder.buildCampaign({
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

  describe('#get', () => {
    let campaign;

    beforeEach(() => {
      const bookshelfCampaign = databaseBuilder.factory.buildCampaign({
        id: 1,
        name: 'My campaign',
      });
      campaign = domainBuilder.buildCampaign(bookshelfCampaign);
      return databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return a Campaign by her id', async () => {
      // when
      const result = await campaignRepository.get(campaign.id);

      // then
      expect(result).to.be.an.instanceof(Campaign);
      expect(result.name).to.equal(campaign.name);
    });

    it('should throw a NotFoundError if campaign can not be found', () => {
      // given
      const nonExistentId = 666;
      // when
      const promise = campaignRepository.get(nonExistentId);
      // then
      return expect(promise).to.have.been.rejectedWith(NotFoundError);
    });
  });

  describe('#update', () => {
    let campaign;

    beforeEach(() => {
      const bookshelfCampaign = databaseBuilder.factory.buildCampaign({
        id: 1,
        title: 'Title',
        customLandingPageText: 'Text',
      });
      campaign = domainBuilder.buildCampaign(bookshelfCampaign);
      return databaseBuilder.commit();
    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return a Campaign domain object', async () => {
      // when
      const campaignSaved = await campaignRepository.update(campaign);

      // then
      expect(campaignSaved).to.be.an.instanceof(Campaign);
    });

    it('should not add row in table "campaigns"', async () => {
      // given
      const rowCount = await BookshelfCampaign.count();

      // when
      await campaignRepository.update(campaign);

      // then
      const rowCountAfterUpdate = await BookshelfCampaign.count();
      expect(rowCountAfterUpdate).to.equal(rowCount);
    });

    it('should update model in database', async () => {
      // given
      campaign.title = 'New title';
      campaign.customLandingPageText = 'New text';

      // when
      const campaignSaved = await campaignRepository.update(campaign);

      // then
      expect(campaignSaved.id).to.equal(campaign.id);
      expect(campaignSaved.title).to.equal('New title');
      expect(campaignSaved.customLandingPageText).to.equal('New text');
    });
  });

  describe('checkIfUserOrganizationHasAccessToCampaign', () => {
    let userId, organizationId, forbiddenUserId, forbiddenOrganizationId, campaignId;
    beforeEach(async () => {

      // given
      userId = databaseBuilder.factory.buildUser().id;
      organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({ userId, organizationId });

      forbiddenUserId = databaseBuilder.factory.buildUser().id;
      forbiddenOrganizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({ userId: forbiddenUserId, organizationId: forbiddenOrganizationId });

      campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;

      await databaseBuilder.commit();

    });

    afterEach(async () => {
      await databaseBuilder.clean();
    });

    it('should return true when the user is a member of an organization that owns the campaign', async () => {
      //when
      const access = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);

      //then
      expect(access).to.be.true;
    });

    it('should return false when the user is not a member of an organization that owns campaign', async () => {
      //when
      const access = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, forbiddenUserId);

      //then
      expect(access).to.be.false;
    });

  });
});
