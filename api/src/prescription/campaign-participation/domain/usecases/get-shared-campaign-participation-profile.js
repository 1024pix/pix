import { MAX_REACHABLE_LEVEL, MAX_REACHABLE_PIX_SCORE } from '../../../../shared/constants.js';
import { NoCampaignParticipationForUserAndCampaign } from '../../../../shared/domain/errors.js';
import { SharedProfileForCampaign } from '../read-models/SharedProfileForCampaign.js';

const getSharedCampaignParticipationProfile = async function ({
  userId,
  campaignId,
  campaignParticipationRepository,
  campaignRepository,
  knowledgeStateRepository,
  knowledgeStateSnapshotRepository,
  competenceRepository,
  areaRepository,
  organizationLearnerRepository,
  locale,
}) {
  const campaignParticipation = await campaignParticipationRepository.findOneByCampaignIdAndUserId({
    campaignId,
    userId,
  });

  if (!campaignParticipation) {
    throw new NoCampaignParticipationForUserAndCampaign();
  }

  const { multipleSendings: campaignAllowsRetry } = await campaignRepository.get(campaignId);
  const isOrganizationLearnerActive = await organizationLearnerRepository.isActive({ campaignId, userId });

  // Le profil partagé est celui que le partage a figé dans l'instantané.
  // L'état de connaissance, lui, continue d'évoluer et ne sait plus dire ce
  // qu'il valait à une date passée. Une participation non partagée n'a pas
  // d'instantané et se lit sur l'état courant.
  const snapshots = await knowledgeStateSnapshotRepository.findByCampaignParticipationIds([campaignParticipation.id]);
  const knowledgeState =
    snapshots[campaignParticipation.id] ?? (await knowledgeStateRepository.findByUserId({ userId }));

  const competences = await competenceRepository.listPixCompetencesOnly({ locale });
  const allAreas = await areaRepository.list({ locale });
  const maxReachableLevel = MAX_REACHABLE_LEVEL;
  const maxReachablePixScore = MAX_REACHABLE_PIX_SCORE;

  return new SharedProfileForCampaign({
    campaignParticipation,
    campaignAllowsRetry,
    isOrganizationLearnerActive,
    competences,
    knowledgeState,
    userId,
    allAreas,
    maxReachableLevel,
    maxReachablePixScore,
  });
};

export { getSharedCampaignParticipationProfile };
