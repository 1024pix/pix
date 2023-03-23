const { expect, databaseBuilder, catchErr, mockLearningContent } = require('../../../test-helper');
const { NotFoundError, UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');

const getCampaign = require('../../../../lib/domain/usecases/get-campaign');
const badgeRepository = require('../../../../lib/infrastructure/repositories/badge-repository');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const campaignReportRepository = require('../../../../lib/infrastructure/repositories/campaign-report-repository');

describe('Integration | UseCase | get-campaign', function () {
  context('Error case', function () {
    it('should throw a NotFoundError when the campaign not exist', async function () {
      const error = await catchErr(getCampaign)({
        campaignId: 'invalid Campaign Id',
        userId: 'whateverId',
        badgeRepository,
        campaignRepository,
        campaignReportRepository,
      });

      expect(error).to.be.instanceOf(NotFoundError);
    });

    it("UserNotAuthorizedToAccessEntityError when user does not belong to organization's campaign", async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;

      await databaseBuilder.commit();

      const error = await catchErr(getCampaign)({
        campaignId,
        userId,
        badgeRepository,
        campaignRepository,
        campaignReportRepository,
      });

      expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });

  context('Type Assessment', function () {
    let userId;
    let campaign;
    let targetProfileId;

    beforeEach(async function () {
      const skillId = 'recArea1_Competence1_Tube1_Skill1';
      const learningContent = {
        areas: [{ id: 'recArea1', competenceIds: ['recArea1_Competence1'] }],
        competences: [
          {
            id: 'recArea1_Competence1',
            areaId: 'recArea1',
            skillIds: [skillId],
            origin: 'Pix',
          },
        ],
        thematics: [],
        tubes: [
          {
            id: 'recArea1_Competence1_Tube1',
            competenceId: 'recArea1_Competence1',
          },
        ],
        skills: [
          {
            id: skillId,
            name: '@recArea1_Competence1_Tube1_Skill1',
            status: 'actif',
            tubeId: 'recArea1_Competence1_Tube1',
            competenceId: 'recArea1_Competence1',
          },
        ],
        challenges: [
          {
            id: 'recArea1_Competence1_Tube1_Skill1_Challenge1',
            skillId: skillId,
            competenceId: 'recArea1_Competence1',
            status: 'validé',
            locales: ['fr-fr'],
          },
        ],
      };
      mockLearningContent(learningContent);

      const organizationId = databaseBuilder.factory.buildOrganization().id;
      userId = databaseBuilder.factory.buildUser().id;
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId });
      campaign = databaseBuilder.factory.buildCampaign({
        name: 'TroTro',
        organizationId,
        targetProfileId,
        type: 'ASSESSMENT',
      });
      databaseBuilder.factory.buildMembership({
        organizationId,
        userId,
      });

      await databaseBuilder.commit();
    });

    it('should get the campaign with no participation', async function () {
      // when
      const resultCampaign = await getCampaign({
        campaignId: campaign.id,
        userId,
        badgeRepository,
        campaignRepository,
        campaignReportRepository,
      });

      // then
      expect(resultCampaign.name).to.equal(campaign.name);
      expect(resultCampaign.badges.length).to.equal(0);
      expect(resultCampaign.stages.length).to.equal(0);
      expect(resultCampaign.reachedStage).to.be.null;
      expect(resultCampaign.totalStage).to.be.null;
    });

    it('should get the campaign stages', async function () {
      //given
      databaseBuilder.factory.buildStage({ targetProfileId, threshold: 0 });

      await databaseBuilder.commit();

      // when
      const resultCampaign = await getCampaign({
        campaignId: campaign.id,
        userId,
        badgeRepository,
        campaignRepository,
        campaignReportRepository,
      });

      // then
      expect(resultCampaign.stages.length).to.equal(1);
      expect(resultCampaign.reachedStage).to.equal(1);
      expect(resultCampaign.totalStage).to.equal(1);
    });

    it('should get the campaign badges', async function () {
      //given
      databaseBuilder.factory.buildBadge({ targetProfileId });
      await databaseBuilder.commit();

      // when
      const resultCampaign = await getCampaign({
        campaignId: campaign.id,
        userId,
        badgeRepository,
        campaignRepository,
        campaignReportRepository,
      });

      // then
      expect(resultCampaign.badges.length).to.equal(1);
    });

    it('should get the average result of participations', async function () {
      //given
      databaseBuilder.factory.buildStage({ targetProfileId, threshold: 0 });
      databaseBuilder.factory.buildStage({ targetProfileId, threshold: 25 });
      databaseBuilder.factory.buildStage({ targetProfileId, threshold: 75 });
      databaseBuilder.factory.buildStage({ targetProfileId, threshold: 100 });

      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        masteryRate: 0.3,
        validatedSkillsCount: 4,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        masteryRate: 0.5,
        validatedSkillsCount: 12,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        masteryRate: 0.5,
        validatedSkillsCount: 12,
        status: 'TO_SHARE',
      });

      await databaseBuilder.commit();

      // when
      const resultCampaign = await getCampaign({
        campaignId: campaign.id,
        userId,
        badgeRepository,
        campaignRepository,
        campaignReportRepository,
      });

      // then
      expect(resultCampaign.averageResult).to.equal(0.4);
      expect(resultCampaign.reachedStage).to.equal(2);
      expect(resultCampaign.totalStage).to.equal(4);
    });
  });

  context('Type PROFILES_COLLECTION', function () {
    it('should not set average Result', async function () {
      //given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign({
        name: 'NO_SE',
        organizationId,
        type: 'PROFILES_COLLECTION',
      }).id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId,
      }).id;

      databaseBuilder.factory.buildMembership({
        organizationId,
        userId,
      });

      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        organizationLearnerId,
      });

      await databaseBuilder.commit();

      // when
      const resultCampaign = await getCampaign({
        campaignId,
        userId,
        badgeRepository,
        campaignRepository,
        campaignReportRepository,
      });

      // then
      expect(resultCampaign.averageResult).to.be.undefined;
    });
  });
});
