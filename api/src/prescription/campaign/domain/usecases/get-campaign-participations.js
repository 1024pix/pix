import { KnowledgeState } from '../../../../shared/domain/models/KnowledgeState.js';
import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';
import * as stageAndStageAcquisitionComparisonService from '../../../stages/domain/services/stage-and-stage-acquisition-comparison-service.js';
import { CampaignResultLevelsPerTubesAndCompetences } from '../models/CampaignResultLevelsPerTubesAndCompetences.js';
import {
  AssessmentCampaignParticipation,
  Badge,
  ProfilesCollectionCampaignParticipation,
  TubeCoverage,
} from '../read-models/CampaignParticipation.js';

const getStagesAndStageAcquisitions = async (
  stageRepository,
  campaignId,
  stageAcquisitionRepository,
  participationIds,
) => {
  const stages = await stageRepository.getByCampaignId(campaignId);
  const stageAcquisitions = stages.length
    ? await stageAcquisitionRepository.getByCampaignParticipations(participationIds)
    : [];
  const acquiredStagesByParticipation = stageAcquisitions.reduce((acquiredStagesByParticipation, acquisition) => {
    if (!acquiredStagesByParticipation[acquisition.campaignParticipationId]) {
      acquiredStagesByParticipation[acquisition.campaignParticipationId] = [];
    }
    acquiredStagesByParticipation[acquisition.campaignParticipationId].push(acquisition);
    return acquiredStagesByParticipation;
  }, {});
  return { stages, acquiredStagesByParticipation };
};

const getBadgesWithBadgesCalculationAndBadgesAcquisitions = async ({
  campaignId,
  participationIds,
  badgeRepository,
  badgeForCalculationRepository,
  badgeAcquisitionRepository,
}) => {
  const badges = await badgeRepository.findByCampaignId(campaignId);
  const badgesForCalculation = await badgeForCalculationRepository.findByCampaignId({ campaignId });
  const badgeAcquisitions =
    await badgeAcquisitionRepository.getAcquiredBadgesForCampaignParticipations(participationIds);
  const acquiredBadgesByParticipation = badgeAcquisitions.reduce((acquiredBadgesByParticipation, acquisition) => {
    if (!acquiredBadgesByParticipation[acquisition.campaignParticipationId]) {
      acquiredBadgesByParticipation[acquisition.campaignParticipationId] = [];
    }
    acquiredBadgesByParticipation[acquisition.campaignParticipationId].push(acquisition);
    return acquiredBadgesByParticipation;
  }, {});
  return { badges, badgesForCalculation, acquiredBadgesByParticipation };
};

const computeTubes = (campaignId, campaignParticipation, learningContent, knowledgeStatesByParticipation) => {
  if (campaignParticipation.status !== CampaignParticipationStatuses.SHARED || !learningContent) {
    return [];
  }

  const campaignResultLevelPerTubesAndCompetences = new CampaignResultLevelsPerTubesAndCompetences({
    id: campaignId,
    learningContent,
  });

  campaignResultLevelPerTubesAndCompetences.addKnowledgeStates(knowledgeStatesByParticipation);

  return campaignResultLevelPerTubesAndCompetences.levelsPerTube.map((tube) => {
    return new TubeCoverage({
      ...tube,
      reachedLevel: tube.meanLevel,
    });
  });
};

const getAcquisitionPercentage = (
  participation,
  badge,
  isAcquired,
  badgesForCalculation,
  knowledgeStatesByParticipations,
) => {
  if (participation.status !== CampaignParticipationStatuses.SHARED) return 0;
  if (isAcquired) return 100;
  return badgesForCalculation
    .find((badgeForCalculation) => badgeForCalculation.id === badge.id)
    .getAcquisitionPercentage(knowledgeStatesByParticipations[participation.id] ?? new KnowledgeState());
};

export const getCampaignParticipations = async function ({
  campaignId,
  locale,
  page,
  since,
  sort,
  campaignRepository,
  badgeRepository,
  badgeForCalculationRepository,
  badgeAcquisitionRepository,
  stageRepository,
  stageAcquisitionRepository,
  campaignParticipationRepository,
  knowledgeStateSnapshotRepository,
  learningContentRepository,
}) {
  const campaign = await campaignRepository.get(campaignId);
  const { models: participations, meta } = await campaignParticipationRepository.findInfoByCampaignId({
    campaignId,
    page,
    since,
    sort,
  });
  const participationIds = participations.map(({ id }) => id);

  if (campaign.isProfilesCollection) {
    const knowledgeStatesByParticipations = await knowledgeStateSnapshotRepository.findByCampaignParticipationIds(
      participations.map((participation) => participation.id),
    );

    const models = await Promise.all(
      participations.map(async (participation) => {
        const participationState = knowledgeStatesByParticipations[participation.id] ?? new KnowledgeState();
        const participationSkillIds = participationState.assessedSkills().map(({ id }) => id);

        const learningContent =
          participationSkillIds.length > 0
            ? await learningContentRepository.findBySkillIds(participationSkillIds, locale)
            : null;

        const tubes = computeTubes(campaignId, participation, learningContent, {
          [participation.id]: participationState,
        });

        return new ProfilesCollectionCampaignParticipation({ ...participation, tubes });
      }),
    );

    return { models, meta };
  }
  const { stages, acquiredStagesByParticipation } = await getStagesAndStageAcquisitions(
    stageRepository,
    campaignId,
    stageAcquisitionRepository,
    participationIds,
  );

  const { badges, badgesForCalculation, acquiredBadgesByParticipation } =
    await getBadgesWithBadgesCalculationAndBadgesAcquisitions({
      campaignId,
      badgeRepository,
      badgeForCalculationRepository,
      badgeAcquisitionRepository,
      participationIds,
    });

  const learningContent = await learningContentRepository.findByCampaignId(campaignId, locale);
  const knowledgeStatesByParticipations = await knowledgeStateSnapshotRepository.findByCampaignParticipationIds(
    participations.map((participation) => participation.id),
  );

  return {
    models: participations.map((participation) => {
      const tubes = computeTubes(campaignId, participation, learningContent, {
        [participation.id]: knowledgeStatesByParticipations[participation.id] ?? new KnowledgeState(),
      });

      const acquiredStagesForParticipation = acquiredStagesByParticipation[participation.id] || [];

      const { reachedStageNumber } = stageAndStageAcquisitionComparisonService.compare(
        stages,
        acquiredStagesForParticipation,
      );

      const badgesAcquisitionsForParticipation = acquiredBadgesByParticipation[participation.id] || [];

      return new AssessmentCampaignParticipation({
        ...participation,
        tubes,
        stages: {
          reachedStage: reachedStageNumber === 0 ? 0 : reachedStageNumber - 1, // exclude stage 0
          numberOfStages: stages.length === 0 ? 0 : stages.length - 1, // exclude stage 0
        },
        badges: badges.map((badge) => {
          // TODO PIX-21173 Create dedicated repository or service for badges to remove logic duplication for acquisition percentage
          const isAcquired = badgesAcquisitionsForParticipation.some(({ badgeId }) => badgeId === badge.id);

          const acquisitionPercentage = getAcquisitionPercentage(
            participation,
            badge,
            isAcquired,
            badgesForCalculation,
            knowledgeStatesByParticipations,
          );

          return new Badge({
            ...badge,
            isAcquired,
            acquisitionPercentage,
          });
        }),
      });
    }),
    meta,
  };
};
