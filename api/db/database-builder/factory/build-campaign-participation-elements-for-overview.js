import Assessment from '../../../lib/domain/models/Assessment';
import buildAssessment from './build-assessment';
import buildOrganization from './build-organization';
import buildCampaignParticipation from './build-campaign-participation';
import buildCampaign from './build-campaign';

export default function buildCampaignParticipationElementsForOverview({
  userId,
  index,
  lastAssessmentState,
  campaignParticipationCreatedAt,
  campaignParticipationSharedAt,
  campaignArchivedAt,
  isShared,
} = {}) {
  const organization = buildOrganization({
    name: `${index} - My organization`,
  });

  const campaign = buildCampaign({
    organizationId: organization.id,
    title: `${index} - My campaign`,
    createdAt: new Date('2000-01-01T10:00:00Z'),
    archivedAt: campaignArchivedAt ? campaignArchivedAt : null,
  });

  const campaignParticipation = buildCampaignParticipation({
    userId,
    createdAt: campaignParticipationCreatedAt,
    campaignId: campaign.id,
    isShared,
    sharedAt: campaignParticipationSharedAt,
  });

  buildAssessment({
    userId,
    campaignParticipationId: campaignParticipation.id,
    state: Assessment.states.COMPLETED,
    createdAt: new Date('2000-07-01T10:00:00Z'),
  });

  buildAssessment({
    userId,
    campaignParticipationId: campaignParticipation.id,
    state: lastAssessmentState,
    createdAt: new Date('2000-07-02T10:00:00Z'),
  });

  return {
    campaign,
    campaignParticipation,
    organization,
  };
}
