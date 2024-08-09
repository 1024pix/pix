import { CampaignParticipationStatuses } from '../../../../src/prescription/shared/domain/constants.js';
import { CampaignParticipationOverview } from '../../../../src/shared/domain/read-models/CampaignParticipationOverview.js';
const { SHARED } = CampaignParticipationStatuses;

const buildCampaignParticipationOverview = function ({
  id = 1,
  createdAt = new Date('2020-01-01'),
  targetProfileId = 1,
  sharedAt = new Date('2020-02-01'),
  organizationName = 'My organization',
  status = SHARED,
  campaignId = 1,
  campaignCode = 'ABCD12',
  campaignTitle = 'My campaign',
  masteryRate = null,
  totalStagesCount = 1,
  validatedStagesCount = 1,
  validatedSkillsCount = 1,
  disabledAt = null,
} = {}) {
  const isShared = status === SHARED;
  return new CampaignParticipationOverview({
    id,
    createdAt,
    targetProfileId,
    isShared,
    sharedAt,
    organizationName,
    status,
    campaignId,
    campaignCode,
    campaignTitle,
    masteryRate,
    validatedSkillsCount,
    totalStagesCount,
    validatedStagesCount,
    disabledAt,
  });
};

export { buildCampaignParticipationOverview };
