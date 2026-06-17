import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import { CombinedCourseBlueprint } from '../../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | get-campaign', function () {
  context('Campaign on Combined Course', function () {
    let campaign, organizationId, targetProfileId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      campaign = databaseBuilder.factory.buildCampaign({
        name: 'TroTro',
        targetProfileId,
        organizationId,
        type: CampaignTypes.ASSESSMENT,
      });

      await databaseBuilder.commit();
    });

    it('should return combinedCourse info when a combined course is associated with a campaign', async function () {
      // given
      const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: campaign.id }).toDTO(),
        ],
      });
      const combinedCourseId = databaseBuilder.factory.buildCombinedCourse({
        code: 'ABCDE1234',
        name: 'Mon parcours Combiné',
        organizationId,
        questId,
      }).id;
      await databaseBuilder.commit();

      // when
      const resultCampaign = await usecases.getCampaign({
        campaignId: campaign.id,
      });

      // then
      expect(resultCampaign.combinedCourse).deep.equal({
        id: combinedCourseId,
        name: 'Mon parcours Combiné',
      });
    });

    it('should not return combinedCourse info when a combined course is not associated with a campaign', async function () {
      // when
      const resultCampaign = await usecases.getCampaign({
        campaignId: campaign.id,
      });

      // then
      expect(resultCampaign.combinedCourse).undefined;
    });
  });
  context('Type ASSESSMENT', function () {
    let campaign;
    let targetProfileId;

    beforeEach(async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      campaign = databaseBuilder.factory.buildCampaign({
        name: 'TroTro',
        targetProfileId,
        organizationId,
        type: CampaignTypes.ASSESSMENT,
      });

      await databaseBuilder.commit();
    });

    it('should get the campaign with no participation', async function () {
      // when
      const resultCampaign = await usecases.getCampaign({
        campaignId: campaign.id,
      });

      // then
      expect(resultCampaign.name).to.equal(campaign.name);
      expect(resultCampaign.badges).to.have.lengthOf(0);
      expect(resultCampaign.stages).to.have.lengthOf(0);
      expect(resultCampaign.reachedStage).to.be.null;
      expect(resultCampaign.totalStage).to.be.null;
    });

    it('should get the campaign stages', async function () {
      //given
      databaseBuilder.factory.buildStage({ targetProfileId, threshold: 0 });

      await databaseBuilder.commit();

      // when
      const resultCampaign = await usecases.getCampaign({
        campaignId: campaign.id,
      });

      // then
      expect(resultCampaign.stages).to.have.lengthOf(1);
      expect(resultCampaign.totalStage).to.equal(1);
    });

    it('should get the campaign badges', async function () {
      //given
      databaseBuilder.factory.buildBadge({ targetProfileId });
      await databaseBuilder.commit();

      // when
      const resultCampaign = await usecases.getCampaign({
        campaignId: campaign.id,
      });

      // then
      expect(resultCampaign.badges).to.have.lengthOf(1);
    });

    it('should get the average result of participations', async function () {
      //given
      databaseBuilder.factory.buildStage({ id: 1, targetProfileId, threshold: 0 });
      databaseBuilder.factory.buildStage({ id: 2, targetProfileId, threshold: 25 });
      databaseBuilder.factory.buildStage({ id: 3, targetProfileId, threshold: 75 });
      databaseBuilder.factory.buildStage({ id: 4, targetProfileId, threshold: 100 });

      databaseBuilder.factory.buildCampaignParticipation({
        id: 1,
        campaignId: campaign.id,
        masteryRate: 0.3,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        id: 2,
        campaignId: campaign.id,
        masteryRate: 0.5,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        id: 3,
        campaignId: campaign.id,
        masteryRate: 0.5,
        status: CampaignParticipationStatuses.STARTED,
      });

      [1, 2, 3].forEach((i) => {
        databaseBuilder.factory.buildStageAcquisition({ stageId: 1, campaignParticipationId: i });
        databaseBuilder.factory.buildStageAcquisition({ stageId: 2, campaignParticipationId: i });
      });

      await databaseBuilder.commit();

      // when
      const resultCampaign = await usecases.getCampaign({
        campaignId: campaign.id,
      });

      // then
      expect(resultCampaign.averageResult).to.equal(0.4);
      expect(resultCampaign.reachedStage).to.equal(2);
      expect(resultCampaign.totalStage).to.equal(4);
    });
  });

  context('Type EXAM', function () {
    context('when there are no participation', function () {
      let campaign;

      before(async function () {
        campaign = databaseBuilder.factory.buildCampaign({
          name: 'TroTro',
          type: CampaignTypes.EXAM,
        });

        await databaseBuilder.commit();
      });

      it('should get the campaign', async function () {
        // when
        const resultCampaign = await usecases.getCampaign({
          campaignId: campaign.id,
        });

        // then
        expect(resultCampaign.name).to.equal(campaign.name);
        expect(resultCampaign.badges).to.have.lengthOf(0);
        expect(resultCampaign.stages).to.have.lengthOf(0);
        expect(resultCampaign.reachedStage).to.be.null;
        expect(resultCampaign.totalStage).to.be.null;
      });
    });

    context('when there are participations', function () {
      let targetProfileId;
      let campaign;
      let resultCampaign;

      before(async function () {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        databaseBuilder.factory.buildBadge({ targetProfileId });
        const stageId = databaseBuilder.factory.buildStage({ targetProfileId }).id;
        campaign = databaseBuilder.factory.buildCampaign({
          name: 'TroTro',
          targetProfileId,
          organizationId,
          type: CampaignTypes.EXAM,
        });

        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          masteryRate: 0.3,
        }).id;

        databaseBuilder.factory.buildStageAcquisition({
          stageId,
          campaignParticipationId,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          masteryRate: 0.5,
        });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          masteryRate: 0.5,
          status: CampaignParticipationStatuses.STARTED,
        });

        await databaseBuilder.commit();

        resultCampaign = await usecases.getCampaign({
          campaignId: campaign.id,
        });
      });

      it('should get the campaign stages', async function () {
        expect(resultCampaign.stages).to.have.lengthOf(1);
        expect(resultCampaign.reachedStage).to.equal(1);
        expect(resultCampaign.totalStage).to.equal(1);
      });

      it('should get the campaign badges', async function () {
        expect(resultCampaign.badges).to.have.lengthOf(1);
      });

      it('should get the average result of participations', async function () {
        expect(resultCampaign.averageResult).to.equal(0.4);
      });
    });
  });

  context('Type PROFILES_COLLECTION', function () {
    it('should not set average Result', async function () {
      //given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const campaignId = databaseBuilder.factory.buildCampaign({
        name: 'NO_SE',
        organizationId,
        type: CampaignTypes.PROFILES_COLLECTION,
      }).id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      }).id;

      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        organizationLearnerId,
      });

      await databaseBuilder.commit();

      // when
      const resultCampaign = await usecases.getCampaign({
        campaignId,
      });

      // then
      expect(resultCampaign.averageResult).to.be.undefined;
    });
  });
});
