const { expect, domainBuilder, databaseBuilder, knex, mockLearningContent } = require('../../../test-helper');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const Campaign = require('../../../../lib/domain/models/Campaign');
const CampaignTypes = require('../../../../lib/domain/models/CampaignTypes');
const { NotFoundError } = require('../../../../lib/domain/errors');
const _ = require('lodash');
const Stage = require('../../../../lib/domain/models/Stage');

describe('Integration | Repository | Campaign', function () {
  describe('#isCodeAvailable', function () {
    beforeEach(async function () {
      databaseBuilder.factory.buildCampaign({ code: 'BADOIT710' });
      await databaseBuilder.commit();
    });

    it('should resolve true if the code is available', async function () {
      // when
      const isCodeAvailable = await campaignRepository.isCodeAvailable('FRANCE998');

      // then
      expect(isCodeAvailable).to.be.true;
    });

    it('should resolve false if the code is not available', async function () {
      // when
      const isCodeAvailable = await campaignRepository.isCodeAvailable('BADOIT710');

      // then
      expect(isCodeAvailable).to.be.false;
    });
  });

  describe('#getByCode', function () {
    let campaign;
    beforeEach(async function () {
      campaign = databaseBuilder.factory.buildCampaign({
        code: 'BADOIT710',
        createdAt: new Date('2018-02-06T14:12:45Z'),
        externalIdHelpImageUrl: 'some url',
        alternativeTextToExternalIdHelpImage: 'alternative text',
      });
      await databaseBuilder.commit();
    });

    it('should resolve the campaign relies to the code', async function () {
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

    it('should resolve null if the code do not correspond to any campaign ', function () {
      // when
      const promise = campaignRepository.getByCode('BIDULEFAUX');

      // then
      return promise.then((result) => {
        expect(result).to.be.null;
      });
    });
  });

  describe('#save', function () {
    afterEach(function () {
      return knex('campaigns').delete();
    });

    it('should save the given campaign with type ASSESSMENT', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const creatorId = user.id;
      const ownerId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({ userId: creatorId, organizationId });
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      await databaseBuilder.commit();

      const campaignToSave = {
        name: 'Evaluation niveau 1 recherche internet',
        code: 'BCTERD153',
        customLandingPageText: 'Parcours évaluatif concernant la recherche internet',
        creatorId,
        ownerId,
        organizationId,
        multipleSendings: true,
        type: CampaignTypes.ASSESSMENT,
        targetProfileId,
        title: 'Parcours recherche internet',
      };

      // when
      const savedCampaign = await campaignRepository.save(campaignToSave);

      // then
      expect(savedCampaign).to.be.instanceof(Campaign);
      expect(savedCampaign.id).to.exist;

      expect(savedCampaign).to.deep.include(
        _.pick(campaignToSave, [
          'name',
          'code',
          'title',
          'type',
          'customLandingPageText',
          'creator',
          'organization',
          'targetProfile',
          'multipleSendings',
          'ownerId',
        ])
      );
    });

    it('should save the given campaign with type PROFILES_COLLECTION', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const creatorId = user.id;
      const ownerId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({ userId: creatorId, organizationId });
      await databaseBuilder.commit();

      const campaignAttributes = {
        name: 'Evaluation niveau 1 recherche internet',
        code: 'BCTERD153',
        customLandingPageText: 'Parcours évaluatif concernant la recherche internet',
        creatorId,
        ownerId,
        organizationId,
        multipleSendings: true,
      };

      const campaignToSave = { ...campaignAttributes, type: CampaignTypes.PROFILES_COLLECTION };

      // when
      const savedCampaign = await campaignRepository.save(campaignToSave);

      // then
      expect(savedCampaign).to.be.instanceof(Campaign);
      expect(savedCampaign.id).to.exist;

      expect(savedCampaign).to.deep.include(
        _.pick(campaignToSave, [
          'name',
          'code',
          'title',
          'type',
          'customLandingPageText',
          'creator',
          'organization',
          'multipleSendings',
          'ownerId',
        ])
      );
    });
  });

  describe('#get', function () {
    let campaign;

    beforeEach(function () {
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ id: 2 });
      const bookshelfCampaign = databaseBuilder.factory.buildCampaign({ id: 1, name: 'My campaign', targetProfile });
      campaign = domainBuilder.buildCampaign(bookshelfCampaign);

      return databaseBuilder.commit();
    });

    it('should return a Campaign by her id', async function () {
      // when
      const result = await campaignRepository.get(campaign.id);

      // then
      expect(result).to.be.an.instanceof(Campaign);
      expect(result.name).to.equal(campaign.name);
    });

    it('should throw a NotFoundError if campaign can not be found', function () {
      // given
      const nonExistentId = 666;
      // when
      const promise = campaignRepository.get(nonExistentId);
      // then
      return expect(promise).to.have.been.rejectedWith(NotFoundError);
    });
  });

  describe('#update', function () {
    let campaign;

    beforeEach(function () {
      campaign = databaseBuilder.factory.buildCampaign();

      return databaseBuilder.commit();
    });

    it('should return a Campaign domain object', async function () {
      // when
      const campaignSaved = await campaignRepository.update({ id: campaign.id, title: 'Title' });

      // then
      expect(campaignSaved).to.be.an.instanceof(Campaign);
    });

    it('should update the correct campaign', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ title: 'MASH' }).id;
      await databaseBuilder.commit();

      // when
      await campaignRepository.update({ id: campaign.id, title: 'Title' });
      const row = await knex.from('campaigns').where({ id: campaignId }).first();

      // then
      expect(row.title).to.equal('MASH');
    });

    it('should not add row in table "campaigns"', async function () {
      // given
      const rowsCountBeforeUpdate = await knex.select('id').from('campaigns');
      // when
      await campaignRepository.update({ id: campaign.id, title: 'Title' });

      // then
      const rowCountAfterUpdate = await knex.select('id').from('campaigns');
      expect(rowCountAfterUpdate.length).to.equal(rowsCountBeforeUpdate.length);
    });

    it('should update model in database', async function () {
      // given
      const archivedBy = databaseBuilder.factory.buildUser().id;
      const ownerId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      const campaignSaved = await campaignRepository.update({
        id: campaign.id,
        title: 'New title',
        name: 'New name',
        customLandingPageText: 'New text',
        archivedAt: new Date('2020-12-12T06:07:08Z'),
        archivedBy,
        ownerId,
      });

      // then
      expect(campaignSaved.id).to.equal(campaign.id);
      expect(campaignSaved.name).to.equal('New name');
      expect(campaignSaved.title).to.equal('New title');
      expect(campaignSaved.customLandingPageText).to.equal('New text');
      expect(campaignSaved.archivedAt).to.deep.equal(new Date('2020-12-12T06:07:08Z'));
      expect(campaignSaved.archivedBy).to.equal(archivedBy);
      expect(campaignSaved.ownerId).to.equal(ownerId);
    });
  });

  describe('#checkIfUserOrganizationHasAccessToCampaign', function () {
    let userId,
      ownerId,
      organizationId,
      userWithDisabledMembershipId,
      forbiddenUserId,
      forbiddenOrganizationId,
      campaignId;
    beforeEach(async function () {
      // given
      userId = databaseBuilder.factory.buildUser().id;
      ownerId = databaseBuilder.factory.buildUser().id;
      organizationId = databaseBuilder.factory.buildOrganization({ userId: ownerId }).id;
      databaseBuilder.factory.buildMembership({ userId, organizationId });

      forbiddenUserId = databaseBuilder.factory.buildUser().id;
      forbiddenOrganizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildMembership({ userId: forbiddenUserId, organizationId: forbiddenOrganizationId });

      userWithDisabledMembershipId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({
        userId: userWithDisabledMembershipId,
        organizationId,
        disabledAt: new Date('2020-01-01'),
      });

      campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;

      await databaseBuilder.commit();
    });

    it('should return true when the user is a member of an organization that owns the campaign', async function () {
      //when
      const access = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, userId);

      //then
      expect(access).to.be.true;
    });

    it('should return false when the user is not a member of an organization that owns campaign', async function () {
      //when
      const access = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(campaignId, forbiddenUserId);

      //then
      expect(access).to.be.false;
    });

    it('should return false when the user is a disabled membership of the organization that owns campaign', async function () {
      //when
      const access = await campaignRepository.checkIfUserOrganizationHasAccessToCampaign(
        campaignId,
        userWithDisabledMembershipId
      );

      //then
      expect(access).to.be.false;
    });
  });

  describe('#checkIfCampaignIsArchived', function () {
    let campaignId;

    it('should return true when the campaign is archived', async function () {
      // given
      campaignId = databaseBuilder.factory.buildCampaign({ archivedAt: new Date() }).id;
      await databaseBuilder.commit();
      // when
      const campaignIsArchived = await campaignRepository.checkIfCampaignIsArchived(campaignId);

      // then
      expect(campaignIsArchived).to.be.true;
    });

    it('should return false when the campaign is not archived', async function () {
      // given
      campaignId = databaseBuilder.factory.buildCampaign({ archivedAt: null }).id;
      await databaseBuilder.commit();

      // when
      const campaignIsArchived = await campaignRepository.checkIfCampaignIsArchived(campaignId);

      // then
      expect(campaignIsArchived).to.be.false;
    });
  });

  describe('#getCampaignTitleByCampaignParticipationId', function () {
    it('should return campaign title when campaign has one', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ title: 'Parcours trop bien' }).id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      await databaseBuilder.commit();

      // when
      const title = await campaignRepository.getCampaignTitleByCampaignParticipationId(campaignParticipationId);

      // then
      expect(title).to.equal('Parcours trop bien');
    });

    it('should return null when campaign has no title', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ title: null }).id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      await databaseBuilder.commit();

      // when
      const title = await campaignRepository.getCampaignTitleByCampaignParticipationId(campaignParticipationId);

      // then
      expect(title).to.be.null;
    });

    it('should return null when campaignParticipationId does not exist', async function () {
      // when
      const title = await campaignRepository.getCampaignTitleByCampaignParticipationId(123);

      // then
      expect(title).to.be.null;
    });

    it('should return the title from the given campaignParticipationId', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ title: 'Parcours trop bien' }).id;
      databaseBuilder.factory.buildCampaignParticipation({ campaignId });

      const otherCampaignId = databaseBuilder.factory.buildCampaign({ title: 'Autre' }).id;
      const otherCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: otherCampaignId,
      }).id;
      await databaseBuilder.commit();

      // when
      const title = await campaignRepository.getCampaignTitleByCampaignParticipationId(otherCampaignParticipationId);

      // then
      expect(title).to.equal('Autre');
    });
  });

  describe('#getCampaignCodeByCampaignParticipationId', function () {
    it('should return campaign code when campaign has one', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ code: 'CAMPAIGN1' }).id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      await databaseBuilder.commit();

      // when
      const code = await campaignRepository.getCampaignCodeByCampaignParticipationId(campaignParticipationId);

      // then
      expect(code).to.equal('CAMPAIGN1');
    });

    it('should return null when campaignParticipationId does not exist', async function () {
      // when
      const code = await campaignRepository.getCampaignCodeByCampaignParticipationId(123);

      // then
      expect(code).to.be.null;
    });

    it('should return the code from the given campaignParticipationId', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ code: 'CAMPAIGN1' }).id;
      databaseBuilder.factory.buildCampaignParticipation({ campaignId });

      const otherCampaignId = databaseBuilder.factory.buildCampaign({ code: 'CAMPAIGN2' }).id;
      const otherCampaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: otherCampaignId,
      }).id;
      await databaseBuilder.commit();

      // when
      const code = await campaignRepository.getCampaignCodeByCampaignParticipationId(otherCampaignParticipationId);

      // then
      expect(code).to.equal('CAMPAIGN2');
    });
  });

  describe('#getCampaignIdByCampaignParticipationId', function () {
    it('should return campaign id', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
      }).id;
      await databaseBuilder.commit();

      // when
      const campaignId = await campaignRepository.getCampaignIdByCampaignParticipationId(campaignParticipationId);

      // then
      expect(campaignId).to.equal(campaign.id);
    });

    it('should return null when campaignParticipationId does not exist', async function () {
      // when
      const campaignId = await campaignRepository.getCampaignIdByCampaignParticipationId(123);

      // then
      expect(campaignId).to.be.null;
    });

    it('should return the campaign id from the given campaignParticipationId', async function () {
      // given
      const campaign = databaseBuilder.factory.buildCampaign();
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
      }).id;

      const otherCampaignId = databaseBuilder.factory.buildCampaign().id;
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: otherCampaignId,
      });
      await databaseBuilder.commit();

      // when
      const campaignId = await campaignRepository.getCampaignIdByCampaignParticipationId(campaignParticipationId);

      // then
      expect(campaignId).to.equal(campaign.id);
    });
  });

  describe('#findStages', function () {
    describe('Stages with level', function () {
      beforeEach(async function () {
        mockLearningContent({
          skills: [
            {
              id: 'rec1',
              name: '@web1',
              level: '1',
              status: 'actif',
            },
            {
              id: 'rec2',
              name: '@web2',
              level: '2',
              status: 'archivé',
            },
            {
              id: 'rec3',
              name: '@web3',
              level: '3',
              status: 'périmé',
            },
            {
              id: 'rec4',
              name: '@garage4',
              level: '4',
              status: 'archivé',
            },
            {
              id: 'rec5',
              name: '@garage6',
              level: '6',
              status: 'actif',
            },
          ],
        });
      });

      it('should compute thresholds according to operative skills', async function () {
        // given
        const wrongCampaign = databaseBuilder.factory.buildCampaign();
        const campaign = databaseBuilder.factory.buildCampaign();
        ['rec1', 'rec2', 'rec3', 'rec4'].forEach((skillId) => {
          databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId });
          databaseBuilder.factory.buildCampaignSkill({ campaignId: wrongCampaign.id, skillId });
        });
        databaseBuilder.factory.buildStage.withLevel({
          targetProfileId: campaign.targetProfileId,
          level: 2,
        });
        databaseBuilder.factory.buildStage.withLevel({
          targetProfileId: wrongCampaign.targetProfileId,
          level: 0,
        });
        await databaseBuilder.commit();

        // when
        const [stage] = await campaignRepository.findStages({ campaignId: campaign.id });

        // then
        expect(stage).to.have.property('threshold', 67);
      });

      it('should return a threshold of 100 when campaign has no skills', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign();
        ['rec3'].forEach((skillId) => {
          databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId });
        });
        databaseBuilder.factory.buildStage.withLevel({
          targetProfileId: campaign.targetProfileId,
          level: 2,
        });
        await databaseBuilder.commit();

        // when
        const [stage] = await campaignRepository.findStages({ campaignId: campaign.id });

        // then
        expect(stage).to.have.property('threshold', 100);
      });

      it('should sort stages by level', async function () {
        // given
        const campaign = databaseBuilder.factory.buildCampaign();
        ['rec1', 'rec2', 'rec3', 'rec4'].forEach((skillId) => {
          databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId });
        });
        const stageId1 = databaseBuilder.factory.buildStage.withLevel({
          targetProfileId: campaign.targetProfileId,
          level: 4,
        }).id;
        const stageId2 = databaseBuilder.factory.buildStage.withLevel({
          targetProfileId: campaign.targetProfileId,
          level: 2,
        }).id;
        await databaseBuilder.commit();

        // when
        const stages = await campaignRepository.findStages({ campaignId: campaign.id });

        // then
        expect(stages[0]).to.have.property('id', stageId2);
        expect(stages[1]).to.have.property('id', stageId1);
      });
      describe('when campaign has no stage', function () {
        it('should return an empty array ', async function () {
          // given
          const campaign = databaseBuilder.factory.buildCampaign();
          ['rec1', 'rec2', 'rec3', 'rec4'].forEach((skillId) => {
            databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId });
          });
          await databaseBuilder.commit();

          // when
          const stage = await campaignRepository.findStages({ campaignId: campaign.id });

          // then
          expect(stage).to.deep.equal([]);
        });
      });
    });

    describe('Stages with threshold', function () {
      it('should retrieve stage given campaignId', async function () {
        // given
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        const campaign = databaseBuilder.factory.buildCampaign();

        databaseBuilder.factory.buildStage({ targetProfileId: campaign.targetProfileId, threshold: 55 });
        databaseBuilder.factory.buildStage({ targetProfileId: campaign.targetProfileId, threshold: 24 });

        databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id });

        await databaseBuilder.commit();

        // when
        const stages = await campaignRepository.findStages({ campaignId: campaign.id });

        // then
        expect(stages.length).to.equal(2);

        expect(stages[0].threshold).to.equal(24);
        expect(stages[1].threshold).to.equal(55);
        expect(stages[0]).to.be.instanceof(Stage);
        expect(stages[1]).to.be.instanceof(Stage);
      });
    });
  });
});
