import _ from 'lodash';

import { UnknownCampaignId } from '../../../../../../src/prescription/campaign/domain/errors.js';
import { Campaign } from '../../../../../../src/prescription/campaign/domain/models/Campaign.js';
import * as campaignAdministrationRepository from '../../../../../../src/prescription/campaign/infrastructure/repositories/campaign-administration-repository.js';
import { CampaignTypes } from '../../../../../../src/prescription/shared/domain/constants.js';
import { catchErr, databaseBuilder, expect, knex, mockLearningContent, sinon } from '../../../../../test-helper.js';

describe('Integration | Repository | Campaign Administration', function () {
  describe('#isCodeAvailable', function () {
    beforeEach(async function () {
      databaseBuilder.factory.buildCampaign({ code: 'BADOIT710' });
      await databaseBuilder.commit();
    });

    it('should resolve true if the code is available', async function () {
      // when
      const isCodeAvailable = await campaignAdministrationRepository.isCodeAvailable({ code: 'FRANCE998' });

      // then
      expect(isCodeAvailable).to.be.true;
    });

    it('should resolve false if the code is not available', async function () {
      // when
      const isCodeAvailable = await campaignAdministrationRepository.isCodeAvailable({ code: 'BADOIT710' });

      // then
      expect(isCodeAvailable).to.be.false;
    });
  });

  describe('#save', function () {
    context('when campaign is of type ASSESSMENT', function () {
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
        const savedCampaign = await campaignAdministrationRepository.save(campaignToSave);

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
          ]),
        );
      });

      context('when target profile has tubes', function () {
        it('should save the active skills of the target profile as campaign skills', async function () {
          // given
          const learningContent = {
            areas: [{ id: 'recArea1', competenceIds: ['recCompetence1'] }],
            competences: [
              {
                id: 'recCompetence1',
                areaId: 'recArea1',
                tubeIds: ['recTube1', 'recTube2', 'recTube3'],
              },
            ],
            tubes: [
              {
                id: 'recTube1',
                skillIds: ['recArchivedSkill1Tube1', 'recActiveSkill2Tube1', 'recActiveSkill3Tube1'],
              },
              {
                id: 'recTube2',
                skillIds: ['recActiveSkill2Tube2', 'recArchivedSkill4Tube2', 'recActiveSkill6Tube2'],
              },
              {
                id: 'recTube3',
                skillIds: ['recArchivedSkill1Tube3', 'recArchivedSkill3Tube3', 'recActiveSkill8Tube3'],
              },
              {
                id: 'recTube4',
                skillIds: ['recSkillTube4'],
              },
            ],
            skills: [
              {
                id: 'recArchivedSkill1Tube1',
                name: 'archivedSkill1Tube1_1',
                status: 'archivé',
                level: 1,
                tubeId: 'recTube1',
              },
              {
                id: 'recActiveSkill2Tube1',
                name: 'activeSkill2Tube1_2',
                status: 'actif',
                level: 2,
                tubeId: 'recTube1',
              },
              {
                id: 'recActiveSkill3Tube1',
                name: 'activeSkill3Tube1_3',
                status: 'actif',
                level: 3,
                tubeId: 'recTube1',
              },
              {
                id: 'recActiveSkill2Tube2',
                name: 'activeSkill2Tube2_2',
                status: 'actif',
                level: 2,
                tubeId: 'recTube2',
              },
              {
                id: 'recArchivedSkill4Tube2',
                name: 'archivedSkill4Tube2_4',
                status: 'archivé',
                level: 4,
                tubeId: 'recTube2',
              },
              {
                id: 'recActiveSkill6Tube2',
                name: 'activeSkill6Tube2_6',
                status: 'actif',
                level: 6,
                tubeId: 'recTube2',
              },
              {
                id: 'recArchivedSkill1Tube3',
                name: 'archivedSkill1Tube3_1',
                status: 'archivé',
                level: 1,
                tubeId: 'recTube3',
              },
              {
                id: 'recArchivedSkill3Tube3',
                name: 'archivedSkill3Tube3_3',
                status: 'archivé',
                level: 3,
                tubeId: 'recTube3',
              },
              {
                id: 'recActiveSkill8Tube3',
                name: 'activeSkill8Tube3_8',
                status: 'actif',
                level: 8,
                tubeId: 'recTube3',
              },
              {
                id: 'recSkillTube4',
                name: 'skillTube4_1',
                status: 'actif',
                level: 1,
                tubeId: 'recTube4',
              },
            ],
          };
          mockLearningContent(learningContent);
          const user = databaseBuilder.factory.buildUser();
          const creatorId = user.id;
          const ownerId = databaseBuilder.factory.buildUser().id;
          const organizationId = databaseBuilder.factory.buildOrganization().id;
          databaseBuilder.factory.buildMembership({ userId: creatorId, organizationId });
          const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
          databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube1', level: 2 });
          databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube2', level: 8 });
          databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube3', level: 3 });
          // random tube
          databaseBuilder.factory.buildTargetProfileTube({ tubeId: 'recTube4' });
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
          const savedCampaign = await campaignAdministrationRepository.save(campaignToSave);

          // then
          const skillIds = await knex('campaign_skills')
            .pluck('skillId')
            .where('campaignId', savedCampaign.id)
            .orderBy('skillId', 'ASC');
          expect(skillIds).to.deepEqualArray(['recActiveSkill2Tube1', 'recActiveSkill2Tube2', 'recActiveSkill6Tube2']);
        });
      });

      it('should not save anything if something goes wrong between campaign creation and skills computation', async function () {
        // given
        const skillRepository = {
          findActiveByTubeId: sinon.stub().rejects(new Error('Forcing rollback')),
        };
        const learningContent = {
          areas: [{ id: 'recArea1', competenceIds: ['recCompetence1'] }],
          competences: [
            {
              id: 'recCompetence1',
              areaId: 'recArea1',
              tubeIds: ['recTube1', 'recTube2', 'recTube3'],
            },
          ],
          tubes: [
            {
              id: 'recTube1',
              skillIds: ['recSkill1'],
            },
          ],
          skills: [
            {
              id: 'recSkill1',
              name: 'recSkill1',
              status: 'actif',
              level: 1,
              tubeId: 'recTube1',
            },
          ],
        };
        mockLearningContent(learningContent);
        const user = databaseBuilder.factory.buildUser();
        const creatorId = user.id;
        const ownerId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildMembership({ userId: creatorId, organizationId });
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube1', level: 2 });
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
        await catchErr(campaignAdministrationRepository.save)(campaignToSave, { skillRepository });

        // then
        const skillIds = await knex('campaign_skills').pluck('skillId');
        const campaignIds = await knex('campaigns').pluck('id');
        expect(skillIds).to.be.empty;
        expect(campaignIds).to.be.empty;
      });
    });

    context('when assessment method is `flash`', function () {
      it('should not save any skills', async function () {
        const user = databaseBuilder.factory.buildUser();
        const creatorId = user.id;
        const ownerId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildMembership({ userId: creatorId, organizationId });

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
          assessmentMethod: 'FLASH',
          targetProfileId: null,
          title: 'Parcours recherche internet',
        };

        const savedCampaign = await campaignAdministrationRepository.save(campaignToSave);

        const skillIds = await knex('campaign_skills').pluck('skillId').where('campaignId', savedCampaign.id);
        expect(skillIds).to.deepEqualArray([]);
      });
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
      const savedCampaign = await campaignAdministrationRepository.save(campaignToSave);

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
        ]),
      );
      const skillIds = await knex('campaign_skills').pluck('skillId').where('campaignId', savedCampaign.id);
      expect(skillIds).to.be.empty;
    });

    context('when there are several campaigns', function () {
      it('should save the given campaigns', async function () {
        // given
        const user = databaseBuilder.factory.buildUser();
        const creatorId = user.id;
        const ownerId = databaseBuilder.factory.buildUser().id;
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        databaseBuilder.factory.buildMembership({ userId: creatorId, organizationId });
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        await databaseBuilder.commit();

        const campaignsToSave = [
          {
            name: 'Evaluation niveau 1 recherche internet',
            code: 'ACTERD153',
            customLandingPageText: 'Parcours évaluatif concernant la recherche internet',
            creatorId,
            ownerId,
            organizationId,
            multipleSendings: true,
            type: CampaignTypes.ASSESSMENT,
            targetProfileId,
            title: 'Parcours recherche internet',
            customResultPageText: null,
            customResultPageButtonText: null,
            customResultPageButtonUrl: null,
          },
          {
            name: 'Evaluation niveau 1 recherche internet #2',
            code: 'BCTERD153',
            customLandingPageText: 'Parcours évaluatif concernant la recherche internet #2',
            creatorId,
            ownerId,
            organizationId,
            multipleSendings: true,
            type: CampaignTypes.ASSESSMENT,
            targetProfileId,
            title: 'Parcours recherche internet #2',
            customResultPageText: 'Bravo !',
            customResultPageButtonText: 'Cliquez ici',
            customResultPageButtonUrl: 'https://hmpg.net/',
          },
        ];

        // when
        await campaignAdministrationRepository.save(campaignsToSave);

        // then
        const savedCampaigns = await knex('campaigns')
          .select(
            'name',
            'code',
            'title',
            'type',
            'customLandingPageText',
            'creatorId',
            'organizationId',
            'targetProfileId',
            'multipleSendings',
            'ownerId',
            'customResultPageText',
            'customResultPageButtonText',
            'customResultPageButtonUrl',
          )
          .orderBy('code');

        expect(savedCampaigns[0]).to.deep.include(
          _.pick(campaignsToSave[0], [
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
            'customResultPageText',
            'customResultPageButtonText',
            'customResultPageButtonUrl',
          ]),
        );

        expect(savedCampaigns[1]).to.deep.include(
          _.pick(campaignsToSave[1], [
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
            'customResultPageText',
            'customResultPageButtonText',
            'customResultPageButtonUrl',
          ]),
        );
      });
    });
  });

  describe('#batchUpdate', function () {
    let clock;
    const frozenTime = new Date('1992-07-07');

    beforeEach(async function () {
      clock = sinon.useFakeTimers({ now: frozenTime, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('should update campaigns', async function () {
      const user = databaseBuilder.factory.buildUser();
      const firstCampaign = new Campaign(databaseBuilder.factory.buildCampaign());
      const secondCampaign = new Campaign(databaseBuilder.factory.buildCampaign());

      await databaseBuilder.commit();
      // given
      firstCampaign.delete(user.id);
      secondCampaign.delete(user.id);

      // when
      await campaignAdministrationRepository.batchUpdate([firstCampaign, secondCampaign]);

      const firstCampaignUpdated = await campaignAdministrationRepository.get(firstCampaign.id);
      const secondCampaignUpdated = await campaignAdministrationRepository.get(secondCampaign.id);

      // then
      expect(firstCampaignUpdated).to.deep.include({
        deletedAt: frozenTime,
        deletedBy: user.id,
      });
      expect(secondCampaignUpdated).to.deep.include({
        deletedAt: frozenTime,
        deletedBy: user.id,
      });
    });
  });

  describe('#update', function () {
    let campaign;

    beforeEach(function () {
      campaign = new Campaign(databaseBuilder.factory.buildCampaign());

      return databaseBuilder.commit();
    });

    it('should return a Campaign domain object', async function () {
      // given
      campaign.updateFields({ title: 'Title' });

      // when
      const campaignSaved = await campaignAdministrationRepository.update(campaign);

      // then
      expect(campaignSaved).to.be.an.instanceof(Campaign);
    });

    it('should update the correct campaign', async function () {
      // given
      const expectedCampaign = new Campaign(databaseBuilder.factory.buildCampaign({ title: 'MASH' }));
      await databaseBuilder.commit();
      campaign.updateFields({ title: 'Title' });

      // when
      await campaignAdministrationRepository.update(campaign);

      // then
      const row = await knex.from('campaigns').where({ id: expectedCampaign.id }).first();
      expect(row.title).to.equal('MASH');
    });

    it('should not add row in table "campaigns"', async function () {
      // given
      const rowsCountBeforeUpdate = await knex.select('id').from('campaigns');
      campaign.updateFields({ title: 'Title' });

      // when
      await campaignAdministrationRepository.update(campaign);

      // then
      const rowCountAfterUpdate = await knex.select('id').from('campaigns');
      expect(rowCountAfterUpdate.length).to.equal(rowsCountBeforeUpdate.length);
    });

    it('should only update model in database', async function () {
      // given
      const newOwnerId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();
      campaign.updateFields({
        title: 'New title',
        name: 'New name',
        customLandingPageText: 'New text',
        ownerId: newOwnerId,
      });
      const archivedAt = new Date();
      campaign.archive(archivedAt, newOwnerId);

      // when
      const campaignSaved = await campaignAdministrationRepository.update(campaign);

      // then
      expect(campaignSaved.id).to.equal(campaign.id);
      expect(campaignSaved.name).to.equal('New name');
      expect(campaignSaved.title).to.equal('New title');
      expect(campaignSaved.archivedBy).to.equal(newOwnerId);
      expect(campaignSaved.archivedAt).to.deep.equal(archivedAt);
      expect(campaignSaved.customLandingPageText).to.equal('New text');
      expect(campaignSaved.ownerId).to.equal(newOwnerId);
    });
  });

  describe('#swapCampaignCode', function () {
    it('should swap campaigns codes', async function () {
      const { code: firstCode, id: firstCampaignId } = databaseBuilder.factory.buildCampaign({ code: 'ABCDEFG' });
      const { code: secondCode, id: secondCampaignId } = databaseBuilder.factory.buildCampaign({ code: 'ZYXWVUT' });

      await databaseBuilder.commit();

      await campaignAdministrationRepository.swapCampaignCodes({ firstCampaignId, secondCampaignId });

      const { code: newCodeFirstId } = await knex('campaigns').select('code').where('id', firstCampaignId).first();
      const { code: newCodeSecondId } = await knex('campaigns').select('code').where('id', secondCampaignId).first();

      expect(newCodeFirstId).to.be.equal(secondCode);
      expect(newCodeSecondId).to.be.equal(firstCode);
    });

    it('should throw an error if one id is not existing', async function () {
      const { code: firstCode, id: firstCampaignId } = databaseBuilder.factory.buildCampaign({ code: 'ABCDEFG' });

      await databaseBuilder.commit();

      await catchErr(campaignAdministrationRepository.swapCampaignCodes)({ firstCampaignId, secondCampaignId: 12 });

      const { code: newCodeFirstId } = await knex('campaigns').select('code').where('id', firstCampaignId).first();

      expect(newCodeFirstId).to.be.equal(firstCode);
    });
  });

  describe('#isFromSameOrganization', function () {
    it('should return false if campaigns do not belongs to the same organization', async function () {
      const { id: firstCampaignId } = databaseBuilder.factory.buildCampaign({ code: 'ABCDEFG' });
      const { id: secondCampaignId } = databaseBuilder.factory.buildCampaign({ code: 'ZYXWVUT' });

      await databaseBuilder.commit();

      const result = await campaignAdministrationRepository.isFromSameOrganization({
        firstCampaignId,
        secondCampaignId,
      });

      expect(result).to.be.false;
    });

    it('should return true if campaigns belongs to same the organization', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const { id: firstCampaignId } = databaseBuilder.factory.buildCampaign({ code: 'ABCDEFG', organizationId });
      const { id: secondCampaignId } = databaseBuilder.factory.buildCampaign({ code: 'ZYXWVUT', organizationId });

      await databaseBuilder.commit();

      const result = await campaignAdministrationRepository.isFromSameOrganization({
        firstCampaignId,
        secondCampaignId,
      });

      expect(result).to.be.true;
    });

    it('throw if one campaign does not exists', async function () {
      const { id: firstCampaignId } = databaseBuilder.factory.buildCampaign({ code: 'ABCDEFG' });

      await databaseBuilder.commit();

      const result = await catchErr(campaignAdministrationRepository.isFromSameOrganization)({
        firstCampaignId,
        secondCampaignId: 12,
      });

      expect(result).to.be.instanceOf(UnknownCampaignId);
    });
  });

  describe('#archiveCampaigns', function () {
    let clock;
    const now = new Date('2023-02-02');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('Mark list of campaign to archived', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const firstCampaignId = databaseBuilder.factory.buildCampaign().id;
      const secondCampaignId = databaseBuilder.factory.buildCampaign().id;

      await databaseBuilder.commit();
      // when
      await campaignAdministrationRepository.archiveCampaigns([firstCampaignId, secondCampaignId], userId);

      const firstResult = await knex('campaigns')
        .select('archivedAt', 'archivedBy')
        .where('id', firstCampaignId)
        .first();
      const secondResult = await knex('campaigns')
        .select('archivedAt', 'archivedBy')
        .where('id', secondCampaignId)
        .first();

      // then
      expect(firstResult.archivedBy).to.be.equal(userId);
      expect(firstResult.archivedAt).to.deep.equal(now);

      expect(secondResult.archivedBy).to.be.equal(userId);
      expect(secondResult.archivedAt).to.deep.equal(now);
    });

    it('Does not update archived campaign', async function () {
      // given
      const archivedAt = new Date('2021-05-06');
      const userWhichArchivedTheCampaign = databaseBuilder.factory.buildUser().id;
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign({
        archivedAt,
        archivedBy: userWhichArchivedTheCampaign,
      }).id;

      await databaseBuilder.commit();
      // when
      await campaignAdministrationRepository.archiveCampaigns([campaignId], userId);

      const result = await knex('campaigns').select('archivedAt', 'archivedBy').where('id', campaignId).first();
      // then
      expect(result.archivedBy).to.be.equal(userWhichArchivedTheCampaign);
      expect(result.archivedAt).to.deep.equal(archivedAt);
    });

    it('Does not throw error if campaign does not exist', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      const call = () => campaignAdministrationRepository.archiveCampaigns([666], userId);

      // when
      expect(call).to.not.throw();
    });
  });
});
