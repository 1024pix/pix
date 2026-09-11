import { CampaignParticipationStatuses } from '../../../shared/domain/constants.ts';

export const getOrganizationLearnerWithParticipations = async function ({
  organizationId,
  organizationLearnerIds,
  organizationRepository,
  campaignParticipationOverviewRepository,
  tagRepository,
  stageRepository,
  stageAcquisitionRepository,
  stageAcquisitionComparisonService,
}) {
  const organization = await organizationRepository.get(organizationId);
  const campaignParticipationOverviewsByLearner =
    await campaignParticipationOverviewRepository.findByOrganizationLearnerIds(organizationLearnerIds);

  const campaignParticipationIds = [];
  const targetProfileIdsSet = new Set();

  campaignParticipationOverviewsByLearner.forEach((campaignParticipationOverviews) => {
    for (const campaignParticipationOverview of campaignParticipationOverviews) {
      if (campaignParticipationOverview.status === CampaignParticipationStatuses.SHARED) {
        campaignParticipationIds.push(campaignParticipationOverview.id);
        targetProfileIdsSet.add(campaignParticipationOverview.targetProfileId);
      }
    }
  });

  const deduplicatedTargetProfileIds = [...targetProfileIdsSet];

  const stages = await stageRepository.getByTargetProfileIds(deduplicatedTargetProfileIds);
  const acquiredStages = await stageAcquisitionRepository.getByCampaignParticipations(campaignParticipationIds);

  const tags = await tagRepository.findByIds(organization.tags.map((tag) => tag.id));

  const resultByLearnerId = new Map();

  organizationLearnerIds.forEach((organizationLearnerId) => {
    const campaignParticipations = campaignParticipationOverviewsByLearner.get(organizationLearnerId) ?? [];
    const campaignParticipationOverviewsWithStages = campaignParticipations.map((campaignParticipationOverview) => {
      const stagesForThisCampaign = stages.filter(
        ({ targetProfileId }) => targetProfileId === campaignParticipationOverview.targetProfileId,
      );
      const acquiredStagesForThisCampaign = acquiredStages.filter(
        ({ campaignParticipationId }) => campaignParticipationId === campaignParticipationOverview.id,
      );
      const stagesComparison = stageAcquisitionComparisonService.compare(
        stagesForThisCampaign,
        acquiredStagesForThisCampaign,
      );

      campaignParticipationOverview.stagesStatus = {
        totalStages: stagesComparison.totalNumberOfStages,
        reachedStages: stagesComparison.reachedStageNumber,
      };

      return campaignParticipationOverview;
    });

    resultByLearnerId.set(organizationLearnerId, {
      organizationLearner: { id: organizationLearnerId },
      organization,
      campaignParticipations: campaignParticipationOverviewsWithStages,
      tagNames: tags.map((tag) => tag.name),
    });
  });

  return resultByLearnerId;
};
