const { catchErr, expect, domainBuilder, databaseBuilder, knex } = require('../../../test-helper');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const Campaign = require('../../../../lib/domain/models/Campaign');
const BookshelfCampaign = require('../../../../lib/infrastructure/data/campaign');
const { NotFoundError } = require('../../../../lib/domain/errors');
const _ = require('lodash');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

describe('Integration | Repository | Campaign', () => {

  describe('#isCodeAvailable', () => {

    beforeEach(async () => {
      databaseBuilder.factory.buildCampaign({ code: 'BADOIT710' });
      await databaseBuilder.commit();
    });

    it('should resolve true if the code is available', async () => {
      // when
      const isCodeAvailable = await campaignRepository.isCodeAvailable('FRANCE998');

      // then
      expect(isCodeAvailable).to.be.true;
    });

    it('should resolve false if the code is not available', async () => {
      // when
      const isCodeAvailable = await campaignRepository.isCodeAvailable('BADOIT710');

      // then
      expect(isCodeAvailable).to.be.false;
    });

  });

  describe('#getByCode', () => {

    let campaign;
    beforeEach(async () => {
      campaign = databaseBuilder.factory.buildCampaign({
        code: 'BADOIT710',
        createdAt: new Date('2018-02-06T14:12:45Z'),
        externalIdHelpImageUrl: 'some url',
        alternativeTextToExternalIdHelpImage: 'alternative text',
      });
      await databaseBuilder.commit();
    });

    it('should resolve the campaign relies to the code', async () => {
      // when
      const actualCampaign = await campaignRepository.getByCode('BADOIT710');

      // then
      const checkedAttributes = [
        'id',
        'name',
        'code',
        'type',
        'createdAt',
        'archivedAt',
        'customLandingPageText',
        'idPixLabel',
        'externalIdHelpImageUrl',
        'alternativeTextToExternalIdHelpImage',
        'title',
      ];
      expect(_.pick(actualCampaign, checkedAttributes)).to.deep.equal(_.pick(campaign, checkedAttributes));
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
    let creatorId, organizationId, targetProfileId;
    let savedCampaign, campaignToSave, campaignAttributes;

    beforeEach(async () => {
      // given
      const creator = databaseBuilder.factory.buildUser({});
      creatorId = creator.id;
      organizationId = databaseBuilder.factory.buildOrganization({}).id;
      databaseBuilder.factory.buildMembership({ userId: creatorId, organizationId });
      targetProfileId = databaseBuilder.factory.buildTargetProfile({}).id;
      await databaseBuilder.commit();

      campaignAttributes = {
        name: 'Evaluation niveau 1 recherche internet',
        code: 'BCTERD153',
        customLandingPageText: 'Parcours évaluatif concernant la recherche internet',
        creatorId,
        organizationId,
      };
    });

    afterEach(() => {
      return knex('campaigns').delete();
    });

    it('should save the given campaign with type ASSESSMENT', async () => {
      // given
      campaignToSave = {
        ...campaignAttributes,
        type: Campaign.types.ASSESSMENT,
        targetProfileId,
        title: 'Parcours recherche internet',
      };

      // when
      savedCampaign = await campaignRepository.create(campaignToSave);

      // then
      expect(savedCampaign).to.be.instanceof(Campaign);
      expect(savedCampaign.id).to.exist;

      expect(savedCampaign).to.deep.include(_.pick(campaignToSave, ['name', 'code', 'title', 'type', 'customLandingPageText', 'creator', 'organization', 'targetProfile']));
    });

    it('should save the given campaign with type PROFILES_COLLECTION', async () => {
      // given
      campaignToSave = { ...campaignAttributes, type: Campaign.types.PROFILES_COLLECTION };

      // when
      savedCampaign = await campaignRepository.create(campaignToSave);

      // then
      expect(savedCampaign).to.be.instanceof(Campaign);
      expect(savedCampaign.id).to.exist;

      expect(savedCampaign).to.deep.include(_.pick(campaignToSave, ['name', 'code', 'title', 'type', 'customLandingPageText', 'creator', 'organization']));
    });
  });

  describe('#get', () => {

    let campaign;

    beforeEach(() => {
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ id: 2 });
      const bookshelfCampaign = databaseBuilder.factory.buildCampaign({ id: 1, name: 'My campaign', targetProfile });
      campaign = domainBuilder.buildCampaign(bookshelfCampaign);

      return databaseBuilder.commit();
    });

    it('should return a Campaign by her id', async () => {
      // when
      const result = await DomainTransaction.execute(async (domainTransaction) =>
        campaignRepository.get(campaign.id, domainTransaction),
      );

      // then
      expect(result).to.be.an.instanceof(Campaign);
      expect(result.name).to.equal(campaign.name);
    });

    it('should throw a NotFoundError if campaign can not be found', async () => {
      // given
      const nonExistentId = 666;

      // when
      const error = await DomainTransaction.execute(async (domainTransaction) =>
        catchErr(campaignRepository.get)(nonExistentId, domainTransaction),
      );

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#update', () => {
    let campaign;

    beforeEach(() => {
      const bookshelfCampaign = databaseBuilder.factory.buildCampaign({
        id: 1,
        title: 'Title',
        customLandingPageText: 'Text',
        archivedAt: new Date('2019-03-01T23:04:05Z'),
      });
      campaign = domainBuilder.buildCampaign(bookshelfCampaign);
      return databaseBuilder.commit();
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
      campaign.name = 'New name';
      campaign.title = 'New title';
      campaign.customLandingPageText = 'New text';
      campaign.archivedAt = new Date('2020-12-12T06:07:08Z');

      // when
      const campaignSaved = await campaignRepository.update(campaign);

      // then
      expect(campaignSaved.id).to.equal(campaign.id);
      expect(campaignSaved.name).to.equal('New name');
      expect(campaignSaved.title).to.equal('New title');
      expect(campaignSaved.customLandingPageText).to.equal('New text');
      expect(campaignSaved.archivedAt).to.deep.equal(new Date('2020-12-12T06:07:08Z'));
    });
  });

  describe('#checkIfUserOrganizationHasAccessToCampaign', () => {
    let userId, ownerId, organizationId, userWithDisabledMembershipId, forbiddenUserId, forbiddenOrganizationId, campaignId;
    beforeEach(async () => {

      // given
      userId = databaseBuilder.factory.buildUser().id;
      ownerId = databaseBuilder.factory.buildUser().id;
      organizationId = databaseBuilder.factory.buildOrganization({ userId: ownerId }).id;
      databaseBuilder.factory.buildMembership({ userId, organizationId });

      forbiddenUserId = databaseBuilder.factory.buildUser().id;
      forbiddenOrganizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({ userId: forbiddenUserId, organizationId: forbiddenOrganizationId });

      userWithDisabledMembershipId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ userId: userWithDisabledMembershipId, organizationId, disabledAt: new Date('2020-01-01') });

      campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;

      await databaseBuilder.commit();
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

    it('should return false when the user is a disabled membership of the organization that owns campaign', async () => {
      //when
      const access = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userWithDisabledMembershipId);

      //then
      expect(access).to.be.false;
    });
  });

  describe('#checkIfCampaignIsArchived', () => {
    let campaignId;

    it('should return true when the campaign is archived', async () => {
      // given
      campaignId = databaseBuilder.factory.buildCampaign({ archivedAt: new Date() }).id;
      await databaseBuilder.commit();
      // when
      const campaignIsArchived = await campaignRepository.checkIfCampaignIsArchived(campaignId);

      // then
      expect(campaignIsArchived).to.be.true;
    });

    it('should return false when the campaign is not archived', async () => {
      // given
      campaignId = databaseBuilder.factory.buildCampaign({ archivedAt: null }).id;
      await databaseBuilder.commit();

      // when
      const campaignIsArchived = await campaignRepository.checkIfCampaignIsArchived(campaignId);

      // then
      expect(campaignIsArchived).to.be.false;
    });
  });
});
