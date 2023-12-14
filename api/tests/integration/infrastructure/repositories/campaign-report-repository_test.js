import { catchErr, databaseBuilder, expect, mockLearningContent } from '../../../test-helper.js';
import * as campaignReportRepository from '../../../../lib/infrastructure/repositories/campaign-report-repository.js';
import { CampaignReport } from '../../../../lib/domain/read-models/CampaignReport.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import { CampaignParticipationStatuses } from '../../../../src/prescription/shared/domain/constants.js';

const { STARTED, SHARED } = CampaignParticipationStatuses;

describe('Integration | Repository | Campaign-Report', function () {
  describe('#get', function () {
    context('campaign information', function () {
      it('returns informations about campaign', async function () {
        const creator = databaseBuilder.factory.buildUser({ firstName: 'Walter', lastName: 'White' });
        const campaign = databaseBuilder.factory.buildCampaign({
          archivedAt: new Date(),
          ownerId: creator.id,
          multipleSendings: false,
        });
        mockLearningContent({ skills: [] });

        await databaseBuilder.commit();
        const result = await campaignReportRepository.get(campaign.id);

        expect(result).to.be.an.instanceof(CampaignReport);
        expect(result).deep.include({
          id: campaign.id,
          name: campaign.name,
          code: campaign.code,
          title: campaign.title,
          idPixLabel: campaign.idPixLabel,
          createdAt: campaign.createdAt,
          customLandingPageText: campaign.customLandingPageText,
          archivedAt: campaign.archivedAt,
          type: campaign.type,
          ownerId: campaign.ownerId,
          ownerLastName: 'White',
          ownerFirstName: 'Walter',
          multipleSendings: campaign.multipleSendings,
        });
      });
    });

    context('target profile information', function () {
      beforeEach(function () {
        const learningContent = {
          skills: [
            { id: 'skill1', tubeId: 'tube1' },
            { id: 'skill2', tubeId: 'tube1' },
            { id: 'skill3', tubeId: 'tube2' },
            { id: 'skill4', tubeId: 'tube3' },
          ],
        };

        mockLearningContent(learningContent);
        return databaseBuilder.commit();
      });

      it('returns general information about target profile', async function () {
        const targetProfile = databaseBuilder.factory.buildTargetProfile({
          name: 'Name',
          description: 'Description',
        });
        const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });

        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'skill1' });
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'skill2' });
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'skill3' });

        await databaseBuilder.commit();
        const result = await campaignReportRepository.get(campaign.id);

        expect(result).deep.include({
          targetProfileId: targetProfile.id,
          targetProfileDescription: targetProfile.description,
          targetProfileName: targetProfile.name,
          targetProfileTubesCount: 2,
          targetProfileAreKnowledgeElementsResettable: false,
        });
      });

      context('Thematic Result information', function () {
        it('returns general information about thematic results', async function () {
          const creator = databaseBuilder.factory.buildUser({ firstName: 'Walter', lastName: 'White' });
          const targetProfile = databaseBuilder.factory.buildTargetProfile({
            name: 'Name',
            description: 'Description',
          });
          const campaign = databaseBuilder.factory.buildCampaign({
            targetProfileId: targetProfile.id,
            archivedAt: new Date(),
            ownerId: creator.id,
            multipleSendings: false,
          });

          databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'skill1' });
          databaseBuilder.factory.buildBadge({ targetProfileId: targetProfile.id, key: 1 });
          databaseBuilder.factory.buildBadge({ targetProfileId: targetProfile.id, key: 2 });
          databaseBuilder.factory.buildBadge({ key: 3 });

          await databaseBuilder.commit();
          const result = await campaignReportRepository.get(campaign.id);

          expect(result.targetProfileThematicResultCount).to.equal(2);
        });
      });

      context('Stages information', function () {
        context('when the target profile has stages', function () {
          it('returns general information about stages', async function () {
            const targetProfile = databaseBuilder.factory.buildTargetProfile();
            const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });

            databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'skill1' });
            databaseBuilder.factory.buildStage({ targetProfileId: targetProfile.id });

            await databaseBuilder.commit();
            const result = await campaignReportRepository.get(campaign.id);

            expect(result.targetProfileHasStage).to.equal(true);
          });
        });
        context('when the target profile has no stages', function () {
          it('returns general information about stages', async function () {
            const { id: otherTargetProfilId } = databaseBuilder.factory.buildTargetProfile();
            const campaign = databaseBuilder.factory.buildCampaign();

            databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'skill1' });
            databaseBuilder.factory.buildStage({ targetProfileId: otherTargetProfilId });

            await databaseBuilder.commit();
            const result = await campaignReportRepository.get(campaign.id);

            expect(result.targetProfileHasStage).to.equal(false);
          });
        });
      });
    });

    context('participations', function () {
      let campaign;
      beforeEach(function () {
        campaign = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'skill1' });

        const learningContent = { skills: [{ id: 'skill1' }] };

        mockLearningContent(learningContent);
        return databaseBuilder.commit();
      });

      it('should only count participations not improved', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId: campaign.id, isImproved: true });
        databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId: campaign.id, isImproved: false });
        await databaseBuilder.commit();

        // when
        const result = await campaignReportRepository.get(campaign.id);

        // then
        expect(result.participationsCount).to.equal(1);
      });

      it('should only count non-deleted participations', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaign.id,
          deletedAt: '2022-03-21',
        });
        databaseBuilder.factory.buildCampaignParticipation({ userId, campaignId: campaign.id, deletedAt: null });
        await databaseBuilder.commit();

        // when
        const result = await campaignReportRepository.get(campaign.id);

        // then
        expect(result.participationsCount).to.equal(1);
      });

      it('should only count shared participations not improved', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaign.id,
          sharedAt: new Date(),
          isImproved: true,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaign.id,
          sharedAt: null,
          status: STARTED,
          isImproved: false,
        });
        await databaseBuilder.commit();

        // when
        const result = await campaignReportRepository.get(campaign.id);

        // then
        expect(result.sharedParticipationsCount).to.equal(0);
      });

      it('should only count shared participations not deleted', async function () {
        // given
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          sharedAt: '2022-03-21',
          status: SHARED,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          sharedAt: '2022-03-10',
          status: SHARED,
          deletedAt: '2022-03-21',
        });
        await databaseBuilder.commit();

        // when
        const result = await campaignReportRepository.get(campaign.id);

        // then
        expect(result.sharedParticipationsCount).to.equal(1);
      });

      it('should not count any shared participations when participation is deleted', async function () {
        // given
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          sharedAt: '2022-03-10',
          status: SHARED,
          deletedAt: '2022-03-21',
        });

        await databaseBuilder.commit();

        // when
        const result = await campaignReportRepository.get(campaign.id);

        // then
        expect(result.sharedParticipationsCount).to.equal(0);
      });
    });

    it('should throw a NotFoundError if campaign can not be found', async function () {
      // given
      const nonExistentId = 666;

      // when
      const error = await catchErr(campaignReportRepository.get)(nonExistentId);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('#findMasteryRatesAndValidatedSkillsCount', function () {
    let campaignId;

    beforeEach(function () {
      campaignId = databaseBuilder.factory.buildCampaign().id;
      return databaseBuilder.commit();
    });

    it('should return array with result', async function () {
      // given
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.1, validatedSkillsCount: 18 });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.3, validatedSkillsCount: 42 });
      await databaseBuilder.commit();

      // when
      const result = await campaignReportRepository.findMasteryRatesAndValidatedSkillsCount(campaignId);

      // then
      expect(result).to.be.instanceOf(Object);
      expect(result.masteryRates).to.have.members([0.1, 0.3]);
      expect(result.validatedSkillsCounts).to.have.members([18, 42]);
    });

    it('should only take into account participations not improved', async function () {
      // given
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.1, isImproved: true });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.3, isImproved: false });
      await databaseBuilder.commit();

      // when
      const result = await campaignReportRepository.findMasteryRatesAndValidatedSkillsCount(campaignId);

      // then
      expect(result).to.deep.equal({ masteryRates: [0.3], validatedSkillsCounts: [0] });
    });

    it('should only take into account participations not deleted', async function () {
      // given
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.1, deletedAt: null });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        masteryRate: 0.3,
        deletedAt: new Date('2019-03-06'),
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignReportRepository.findMasteryRatesAndValidatedSkillsCount(campaignId);

      // then
      expect(result).to.deep.equal({ masteryRates: [0.1], validatedSkillsCounts: [0] });
    });

    it('should only take into account shared participations', async function () {
      // given
      databaseBuilder.factory.buildCampaignParticipation({ campaignId, masteryRate: 0.1, sharedAt: new Date() });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        masteryRate: 0.3,
        sharedAt: null,
        status: STARTED,
      });
      await databaseBuilder.commit();

      // when
      const result = await campaignReportRepository.findMasteryRatesAndValidatedSkillsCount(campaignId);

      // then
      expect(result).to.deep.equal({ masteryRates: [0.1], validatedSkillsCounts: [0] });
    });

    it('should return empty array if campaign can not be found', async function () {
      // given
      const nonExistentId = 666;

      // when
      const result = await campaignReportRepository.findMasteryRatesAndValidatedSkillsCount(nonExistentId);

      // then
      expect(result).to.deep.equal({ masteryRates: [], validatedSkillsCounts: [] });
    });
  });
});
