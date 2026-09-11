import { CampaignParticipationStatuses } from '../../../shared/domain/constants.ts';

export class OrganizationLearnerCampaignParticipation {
  id = null;
  campaignId = null;
  targetProfileId = null;
  organizationLearnerId = null;
  status = CampaignParticipationStatuses.STARTED;
  masteryRate = 0.0;
  validatedSkillsCount = 0;
  totalStagesCount = 0;
  validatedStagesCount = 0;

  constructor({
    id,
    campaignId,
    targetProfileId,
    organizationLearnerId,
    status,
    masteryRate,
    validatedSkillsCount,
    totalStagesCount,
    validatedStagesCount,
  }) {
    this.id = id;
    this.campaignId = campaignId;
    this.targetProfileId = targetProfileId;
    this.organizationLearnerId = organizationLearnerId;
    this.status = status;
    this.masteryRate = masteryRate;
    this.validatedSkillsCount = validatedSkillsCount;
    this.totalStagesCount = totalStagesCount;
    this.validatedStagesCount = validatedStagesCount;
  }
}
