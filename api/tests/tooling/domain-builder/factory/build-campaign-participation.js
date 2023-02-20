import CampaignParticipation from '../../../../lib/domain/models/CampaignParticipation';
import CampaignParticipationStatuses from '../../../../lib/domain/models/CampaignParticipationStatuses';
import buildCampaign from './build-campaign';
const { SHARED } = CampaignParticipationStatuses;

export default function buildCampaignParticipation({
  id = 1,
  campaign = buildCampaign(),
  sharedAt = new Date('2020-02-01'),
  createdAt = new Date('2020-01-01'),
  deletedAt = null,
  participantExternalId = 'Mon mail pro',
  assessments = [],
  userId = 123,
  status = SHARED,
  validatedSkillsCount,
  organizationLearnerId = null,
  deletedBy = null,
} = {}) {
  const isShared = status === SHARED;
  return new CampaignParticipation({
    id,
    campaign,
    status,
    sharedAt: isShared ? sharedAt : null,
    createdAt,
    deletedAt,
    participantExternalId,
    assessments,
    userId,
    validatedSkillsCount,
    organizationLearnerId,
    deletedBy,
  });
}
