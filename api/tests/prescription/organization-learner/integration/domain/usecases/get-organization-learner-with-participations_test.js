import * as stageAcquisitionComparisonService from '../../../../../../src/evaluation/domain/services/stages/stage-and-stage-acquisition-comparison-service.js';
import * as stageAcquisitionRepository from '../../../../../../src/evaluation/infrastructure/repositories/stage-acquisition-repository.js';
import * as stageRepository from '../../../../../../src/evaluation/infrastructure/repositories/stage-repository.js';
import { Organization } from '../../../../../../src/organizational-entities/domain/models/Organization.js';
import { tagRepository } from '../../../../../../src/organizational-entities/infrastructure/repositories/tag.repository.js';
import { CampaignParticipationOverview } from '../../../../../../src/prescription/campaign-participation/domain/read-models/CampaignParticipationOverview.js';
import * as campaignParticipationOverviewRepository from '../../../../../../src/prescription/campaign-participation/infrastructure/repositories/campaign-participation-overview-repository.js';
import { getOrganizationLearnerWithParticipations } from '../../../../../../src/prescription/organization-learner/domain/usecases/get-organization-learner-with-participations.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import * as organizationRepository from '../../../../../../src/shared/infrastructure/repositories/organization-repository.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | UseCases | get-organization-learner-with-participations', function () {
  describe('without stages', function () {
    it('should return organization learner with participations', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
      });
      const tags = [
        databaseBuilder.factory.buildTag({ name: 'AEFE' }),
        databaseBuilder.factory.buildTag({ name: 'AGRI' }),
      ];
      for (const tag of tags) {
        databaseBuilder.factory.buildOrganizationTag({ organizationId: organization.id, tagId: tag.id });
      }
      const firstTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const firstCampaign = databaseBuilder.factory.buildCampaign({ targetProfileId: firstTargetProfileId });
      const firstCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: firstCampaign.id,
        userId,
        organizationLearnerId,
      });

      const secondTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const secondCampaign = databaseBuilder.factory.buildCampaign({ targetProfileId: secondTargetProfileId });
      const secondCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: secondCampaign.id,
        userId,
        organizationLearnerId,
      });
      await databaseBuilder.commit();

      // when
      const result = await getOrganizationLearnerWithParticipations({
        organizationLearnerId,
        organizationId: organization.id,
        organizationRepository,
        campaignParticipationOverviewRepository,
        tagRepository,
        stageRepository,
        stageAcquisitionRepository,
        stageAcquisitionComparisonService,
      });

      // then
      expect(result.organizationLearner.id).to.equal(organizationLearnerId);

      expect(result.organization).to.be.an.instanceOf(Organization);
      expect(result.organization.id).to.equal(organization.id);

      expect(result.campaignParticipations).to.have.lengthOf(2);
      expect(result.campaignParticipations[0]).to.be.an.instanceOf(CampaignParticipationOverview);
      expect(result.campaignParticipations[1]).to.be.an.instanceOf(CampaignParticipationOverview);
      expect(result.campaignParticipations).deep.members([
        {
          id: firstCampaignParticipation.id,
          createdAt: firstCampaignParticipation.createdAt,
          targetProfileId: firstTargetProfileId,
          isShared: true,
          sharedAt: firstCampaignParticipation.sharedAt,
          organizationName: organization.name,
          status: CampaignParticipationStatuses.SHARED,
          campaignId: firstCampaign.id,
          campaignCode: firstCampaign.code,
          campaignTitle: firstCampaign.title,
          campaignName: firstCampaign.name,
          masteryRate: null,
          validatedSkillsCount: null,
          totalStagesCount: 0,
          validatedStagesCount: 0,
          disabledAt: null,
          isDisabled: false,
          isCampaignMultipleSendings: false,
          isOrganizationLearnerDisabled: false,
          campaignType: CampaignTypes.ASSESSMENT,
          updatedAt: undefined,
          canRetry: false,
        },
        {
          id: secondCampaignParticipation.id,
          createdAt: secondCampaignParticipation.createdAt,
          targetProfileId: secondTargetProfileId,
          isShared: true,
          sharedAt: secondCampaignParticipation.sharedAt,
          organizationName: organization.name,
          status: CampaignParticipationStatuses.SHARED,
          campaignId: secondCampaign.id,
          campaignCode: secondCampaign.code,
          campaignTitle: secondCampaign.title,
          campaignName: secondCampaign.name,
          masteryRate: null,
          validatedSkillsCount: null,
          totalStagesCount: 0,
          validatedStagesCount: 0,
          disabledAt: null,
          isDisabled: false,
          isCampaignMultipleSendings: false,
          isOrganizationLearnerDisabled: false,
          campaignType: CampaignTypes.ASSESSMENT,
          updatedAt: undefined,
          canRetry: false,
        },
      ]);
    });
  });

  describe('with stages', function () {
    it('should return organization learner with participations and its associated stages', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
      });

      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

      // stages
      const stage1 = databaseBuilder.factory.buildStage({ targetProfileId: targetProfileId });
      databaseBuilder.factory.buildStage({ targetProfileId: targetProfileId, threshold: 20 });

      const campaign = databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfileId });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId,
        organizationLearnerId,
      });

      databaseBuilder.factory.buildStageAcquisition({
        stageId: stage1.id,
        campaignParticipationId: campaignParticipation.id,
      });
      await databaseBuilder.commit();

      // when
      const result = await getOrganizationLearnerWithParticipations({
        organizationLearnerId,
        organizationId: organization.id,
        organizationRepository,
        campaignParticipationOverviewRepository,
        tagRepository,
        stageRepository,
        stageAcquisitionRepository,
        stageAcquisitionComparisonService,
      });

      // then
      expect(result.organizationLearner.id).to.equal(organizationLearnerId);

      expect(result.organization).to.be.an.instanceOf(Organization);
      expect(result.organization.id).to.equal(organization.id);

      expect(result.campaignParticipations).to.have.lengthOf(1);
      expect(result.campaignParticipations[0]).to.be.an.instanceOf(CampaignParticipationOverview);
      expect(result.campaignParticipations[0]).deep.equal({
        id: campaignParticipation.id,
        createdAt: campaignParticipation.createdAt,
        targetProfileId,
        isShared: true,
        sharedAt: campaignParticipation.sharedAt,
        organizationName: organization.name,
        status: CampaignParticipationStatuses.SHARED,
        campaignId: campaign.id,
        campaignCode: campaign.code,
        campaignTitle: campaign.title,
        campaignName: campaign.name,
        masteryRate: null,
        validatedSkillsCount: null,
        totalStagesCount: 2,
        validatedStagesCount: 1,
        disabledAt: null,
        isDisabled: false,
        isCampaignMultipleSendings: false,
        isOrganizationLearnerDisabled: false,
        campaignType: CampaignTypes.ASSESSMENT,
        updatedAt: undefined,
        canRetry: false,
      });
    });
  });
});
