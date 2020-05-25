const { expect, domainBuilder, databaseBuilder, knex } = require('../../../test-helper');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const Campaign = require('../../../../lib/domain/models/Campaign');
const CampaignReport = require('../../../../lib/domain/models/CampaignReport');
const BookshelfCampaign = require('../../../../lib/infrastructure/data/campaign');
const { NotFoundError } = require('../../../../lib/domain/errors');
const _ = require('lodash');

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

    let campaignToInsert;
    beforeEach(async () => {
      campaignToInsert = databaseBuilder.factory.buildCampaign(
        {
          code: 'BADOIT710',
          createdAt: new Date('2018-02-06T14:12:45Z')
        });
      await databaseBuilder.commit();
    });

    it('should resolve the campaign relies to the code', async () => {
      // when
      const actualCampaign = await campaignRepository.getByCode('BADOIT710');

      // then
      expect(actualCampaign.id).to.equal(campaignToInsert.id);
      expect(actualCampaign.name).to.equal(campaignToInsert.name);
      expect(actualCampaign.code).to.equal(campaignToInsert.code);
      expect(actualCampaign.organizationId).to.equal(campaignToInsert.organizationId);
      expect(actualCampaign.createdAt).to.deep.equal(campaignToInsert.createdAt);
      expect(actualCampaign.targetProfileId).to.equal(campaignToInsert.targetProfileId);
      expect(actualCampaign.customLandingPageText).to.equal(campaignToInsert.customLandingPageText);
      expect(actualCampaign.idPixLabel).to.equal(campaignToInsert.idPixLabel);
      expect(actualCampaign.title).to.equal(campaignToInsert.title);
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
    let savedCampaign, campaignToSave, domainCreator, campaignAttributes;

    beforeEach(async () => {
      // given
      const creator = databaseBuilder.factory.buildUser({});
      creatorId = creator.id;
      organizationId = databaseBuilder.factory.buildOrganization({}).id;
      databaseBuilder.factory.buildMembership({ userId: creatorId, organizationId });
      targetProfileId = databaseBuilder.factory.buildTargetProfile({}).id;
      await databaseBuilder.commit();

      domainCreator = domainBuilder.buildUser(creator);

      campaignAttributes = {
        name: 'Evaluation niveau 1 recherche internet',
        code: 'BCTERD153',
        customLandingPageText: 'Parcours évaluatif concernant la recherche internet',
        creatorId,
        creator: domainCreator,
        organizationId,
      };
    });

    afterEach(() => {
      return knex('campaigns').delete();
    });

    it('should save the given campaign with type ASSESSMENT', async () => {
      // given
      campaignToSave = domainBuilder.buildCampaign.ofTypeAssessment({
        ...campaignAttributes,
        targetProfileId,
        title: 'Parcours recherche internet',
      });
      campaignToSave.id = undefined;

      // when
      savedCampaign = await campaignRepository.save(campaignToSave);

      // then
      expect(savedCampaign).to.be.instanceof(Campaign);
      expect(savedCampaign.id).to.exist;

      expect(savedCampaign).to.deep.include(_.pick(campaignToSave, ['name', 'code', 'title', 'type', 'customLandingPageText', 'creatorId', 'organizationId']));
    });

    it('should save the given campaign with type PROFILES_COLLECTION', async () => {
      // given
      campaignToSave = domainBuilder.buildCampaign.ofTypeProfilesCollection(campaignAttributes);
      campaignToSave.id = undefined;

      // when
      savedCampaign = await campaignRepository.save(campaignToSave);

      // then
      expect(savedCampaign).to.be.instanceof(Campaign);
      expect(savedCampaign.id).to.exist;

      expect(savedCampaign).to.deep.include(_.pick(campaignToSave, ['name', 'code', 'title', 'type', 'customLandingPageText', 'creatorId', 'organizationId']));
    });
  });

  describe('#findPaginatedFilteredByOrganizationIdWithCampaignReports', () => {
    it('should return campaign’s creator', async () => {
      // given
      const creatorId = databaseBuilder.factory.buildUser({
        firstName: 'Daenerys',
        lastName: 'Targaryen',
      }).id;
      const organizationId = databaseBuilder.factory.buildOrganization({}).id;
      databaseBuilder.factory.buildCampaign({
        name: 'campaign1',
        code: 'AZERTY123',
        createdAt: '2019-07-30 09:35:45',
        creatorId,
        organizationId,
      });
      await databaseBuilder.commit();
      const filter = {};
      const page = { number: 1, size: 3 };

      // when
      const { models: campaigns } = await campaignRepository.findPaginatedFilteredByOrganizationIdWithCampaignReports({ organizationId, filter, page });

      // then
      expect(campaigns[0].creator.firstName).to.equal('Daenerys');
      expect(campaigns[0].creator.lastName).to.equal('Targaryen');
    });

    let filter, page;
    let organizationId, targetProfileId, creatorId;
    let campaign;

    beforeEach(async () => {
      organizationId = databaseBuilder.factory.buildOrganization({}).id;
      targetProfileId = databaseBuilder.factory.buildTargetProfile({ organizationId }).id;
      creatorId = databaseBuilder.factory.buildUser({}).id;
      await databaseBuilder.commit();

      filter = {};
      page = { number: 1, size: 3 };
    });

    context('when the given organization has no campaign', () => {

      it('should return an empty array', async () => {
        // given
        const otherOrganizationId = databaseBuilder.factory.buildOrganization({}).id;
        await databaseBuilder.commit();

        // when
        const { models: campaignsWithReports, meta } = await campaignRepository.findPaginatedFilteredByOrganizationIdWithCampaignReports({ organizationId: otherOrganizationId, filter, page });

        // then
        expect(campaignsWithReports).to.deep.equal([]);
        expect(meta.hasCampaigns).to.equal(false);
      });
    });

    context('when the given organization has campaigns', () => {

      it('should return campaign with all attributes', async () => {
        // given
        campaign = databaseBuilder.factory.buildCampaign({
          name: 'campaign name',
          code: 'AZERTY789',
          organizationId,
          targetProfileId,
          creatorId,
        });
        await databaseBuilder.commit();

        // when
        const { models: campaignsWithReports } = await campaignRepository.findPaginatedFilteredByOrganizationIdWithCampaignReports({ organizationId, filter, page });

        // then
        expect(campaignsWithReports[0]).to.be.instanceof(Campaign);

        expect(campaignsWithReports[0]).to.deep.include(_.pick(campaign, ['id', 'name', 'code', 'createdAt', 'targetProfileId', 'idPixLabel', 'title', 'type', 'customLandingPageText', 'organizationId']));
      });

      it('should return hasCampaign to true if the organization has one campaign at least', async () => {
        // given
        const organizationId2 = databaseBuilder.factory.buildOrganization({}).id;
        databaseBuilder.factory.buildCampaign({
          organizationId: organizationId2,
          targetProfileId,
          creatorId,
        });
        databaseBuilder.factory.buildCampaign({
          organizationId,
          targetProfileId,
          creatorId,
        });
        await databaseBuilder.commit();

        // when
        const { meta } = await campaignRepository.findPaginatedFilteredByOrganizationIdWithCampaignReports({ organizationId, filter, page });

        // then
        expect(meta.hasCampaigns).to.equal(true);
      });

      it('should sort campaigns by descending creation date', async () => {
        // given
        const createdAtInThePast = new Date('2010-07-30T09:35:45Z');
        const createdAtInThePresent = new Date('2020-07-30T09:35:45Z');
        const createdAtInTheFuture = new Date('2030-07-30T09:35:45Z');

        const campaignBInThePastId = databaseBuilder.factory.buildCampaign({ organizationId, name: 'B', createdAt: createdAtInThePast }).id;
        const campaignAInThePresentId = databaseBuilder.factory.buildCampaign({ organizationId, name: 'A', createdAt: createdAtInThePresent  }).id;
        const campaignBInTheFutureId = databaseBuilder.factory.buildCampaign({ organizationId, name: 'B', createdAt: createdAtInTheFuture }).id;
        await databaseBuilder.commit();

        // when
        const { models: campaignsWithReports } = await campaignRepository.findPaginatedFilteredByOrganizationIdWithCampaignReports({ organizationId, filter, page });

        // then
        expect(campaignsWithReports).to.have.lengthOf(3);
        expect(_.map(campaignsWithReports, 'id')).to.deep.equal([campaignBInTheFutureId, campaignAInThePresentId, campaignBInThePastId]);
      });

      context('when some campaigns are archived', async () => {

        it('should be able to retrieve only campaigns that are archived', async () => {
          // given
          organizationId = databaseBuilder.factory.buildOrganization().id;
          databaseBuilder.factory.buildCampaign({ organizationId, archivedAt: new Date('2010-07-30T09:35:45Z') });
          databaseBuilder.factory.buildCampaign({ organizationId, archivedAt: new Date('2010-07-30T09:35:45Z') });
          databaseBuilder.factory.buildCampaign({ organizationId, archivedAt: null });
          databaseBuilder.factory.buildCampaign({ organizationId, archivedAt: null });
          databaseBuilder.factory.buildCampaign({ organizationId, archivedAt: null });
          filter.ongoing = false;

          await databaseBuilder.commit();
          // when
          const { models: archivedCampaigns } = await campaignRepository.findPaginatedFilteredByOrganizationIdWithCampaignReports({ organizationId, filter, page });

          // then
          expect(archivedCampaigns).to.have.lengthOf(2);
          expect(archivedCampaigns[0].archivedAt).is.not.null;
        });
      });

      context('when campaigns have participants', async () => {

        it('should return the campaigns of the given organization id with campaignReports', async () => {
          // given
          const campaign = databaseBuilder.factory.buildCampaign({
            name: 'campaign1',
            code: 'AZERTY123',
            organizationId,
            targetProfileId,
          });
          const otherCampaignId = databaseBuilder.factory.buildCampaign(
            {
              name: 'campaign2',
              code: 'AZERTY456',
              organizationId,
              targetProfileId,
            }).id;
          _.each([
            { campaignId: campaign.id, isShared: true },
            { campaignId: campaign.id, isShared: false },
            { campaignId: campaign.id, isShared: false },
            { campaignId: otherCampaignId, isShared: true },
            { campaignId: otherCampaignId, isShared: true },
          ], (campaignParticipation) => {
            databaseBuilder.factory.buildCampaignParticipation(campaignParticipation);
          });
          await databaseBuilder.commit();

          // when
          const { models: campaignsWithReports } = await campaignRepository.findPaginatedFilteredByOrganizationIdWithCampaignReports({ organizationId, filter, page });
          const sortedCampaignsWithReports = _.sortBy(campaignsWithReports, [(camp) => { return camp.id; }]);

          // then
          expect(_.map(sortedCampaignsWithReports, 'id')).to.have.members([campaign.id, otherCampaignId]);
          expect(sortedCampaignsWithReports[0]).to.be.instanceOf(Campaign);
          expect(sortedCampaignsWithReports[0].campaignReport).to.be.instanceOf(CampaignReport);
          expect(sortedCampaignsWithReports[0].campaignReport).to.deep.equal({ id: campaign.id, participationsCount: 3, sharedParticipationsCount: 1 });
          expect(sortedCampaignsWithReports[1].campaignReport).to.deep.equal({ id: otherCampaignId, participationsCount: 2, sharedParticipationsCount: 2 });
        });
      });

      context('when campaigns do not have participants', async () => {

        it('should return the campaigns of the given organization id with campaignReports', async () => {
          // given
          campaign = databaseBuilder.factory.buildCampaign({
            name: 'campaign name',
            code: 'AZERTY789',
            organizationId,
            targetProfileId,
            creatorId,
          });
          await databaseBuilder.commit();

          // when
          const { models: campaignsWithReports } = await campaignRepository.findPaginatedFilteredByOrganizationIdWithCampaignReports({ organizationId, filter, page });

          // then
          expect(campaignsWithReports[0].campaignReport.id).to.equal(campaign.id);
          expect(campaignsWithReports[0].campaignReport.participationsCount).to.equal(0);
          expect(campaignsWithReports[0].campaignReport.sharedParticipationsCount).to.equal(0);
        });
      });

      context('when some campaigns names match the "name" search pattern', () => {
        // given
        const filter = { name: 'matH' };

        beforeEach(() => {
          _.each([
            { name: 'Maths L1' },
            { name: 'Maths L2' },
            { name: 'Chimie' },
            { name: 'Physique' },
            { name: 'Droit' },
          ], (campaign) => {
            databaseBuilder.factory.buildCampaign({ ...campaign, organizationId });
          });

          return databaseBuilder.commit();
        });

        it('should return these campaigns only', async () => {
          // when
          const { models: actualCampaignsWithReports } = await campaignRepository.findPaginatedFilteredByOrganizationIdWithCampaignReports({ organizationId, filter, page });

          // then
          expect(_.map(actualCampaignsWithReports, 'name')).to.have.members(['Maths L1', 'Maths L2']);
        });
      });

      context('when some campaigns creatorId match the the given creatorId searched', () => {

        let filter;

        beforeEach(() => {
          const creatorId1 = databaseBuilder.factory.buildUser({}).id;
          const creatorId2 = databaseBuilder.factory.buildUser({}).id;

          filter = { creatorId: creatorId1 };

          _.each([
            { name: 'Maths L1', creatorId: creatorId1 },
            { name: 'Maths L2', creatorId: creatorId2 },
            { name: 'Chimie', creatorId: creatorId1 },
          ], (campaign) => {
            databaseBuilder.factory.buildCampaign({ ...campaign, organizationId });
          });

          return databaseBuilder.commit();
        });

        it('should return the campaign with right creatorId', async () => {
          const { models: actualCampaignsWithReports } = await campaignRepository.findPaginatedFilteredByOrganizationIdWithCampaignReports({ organizationId, filter, page });

          expect(_.map(actualCampaignsWithReports, 'name')).to.have.members(['Maths L1', 'Chimie']);
        });
      });

      context('when the given filter search property is not searchable', () => {
        // given
        const filter = { code: 'FAKECODE' };
        const page = { number: 1, size: 10 };

        beforeEach(() => {
          _.each([
            { name: 'Maths' },
            { name: 'Chimie' },
            { name: 'Physique' },
            { name: 'Droit' },
          ], (campaign) => {
            databaseBuilder.factory.buildCampaign({ ...campaign, organizationId });
          });

          return databaseBuilder.commit();
        });

        it('should ignore the filter and return all campaigns', async () => {
          // when
          const { models: actualCampaignsWithReports } = await campaignRepository.findPaginatedFilteredByOrganizationIdWithCampaignReports({ organizationId, filter, page });

          // then
          expect(actualCampaignsWithReports).to.have.lengthOf(4);
        });
      });

      context('when campaigns amount exceed page size', () => {
        // given
        let expectedPagination;

        beforeEach(() => {
          _.times(12, () => databaseBuilder.factory.buildCampaign({ organizationId }));
          expectedPagination = { page: page.number, pageSize: page.size, pageCount: 4, rowCount: 12 };
          return databaseBuilder.commit();
        });

        it('should return page size number of campaigns', async () => {
          // when
          const { models: campaignsWithReports, meta: pagination } = await campaignRepository.findPaginatedFilteredByOrganizationIdWithCampaignReports({ organizationId, filter, page });

          // then
          expect(campaignsWithReports).to.have.lengthOf(3);
          expect(pagination).to.include(expectedPagination);
        });
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
    let userId, ownerId, organizationId, forbiddenUserId, forbiddenOrganizationId, campaignId;
    beforeEach(async () => {

      // given
      userId = databaseBuilder.factory.buildUser().id;
      ownerId = databaseBuilder.factory.buildUser().id;
      organizationId = databaseBuilder.factory.buildOrganization({ userId: ownerId }).id;
      databaseBuilder.factory.buildMembership({ userId, organizationId });

      forbiddenUserId = databaseBuilder.factory.buildUser().id;
      forbiddenOrganizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({ userId: forbiddenUserId, organizationId: forbiddenOrganizationId });

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
