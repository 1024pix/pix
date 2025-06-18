import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';
import { CampaignResultLevelsPerTubesAndCompetences } from '../models/CampaignResultLevelsPerTubesAndCompetences.js';
import {
  AssessmentCampaignParticipation,
  ProfilesCollectionCampaignParticipation,
  TubeCoverage,
} from '../read-models/CampaignParticipation.js';

const getCampaignParticipations = async function ({
  campaignId,
  locale,
  page,
  campaignRepository,
  campaignParticipationRepository,
  knowledgeElementSnapshotRepository,
  learningContentRepository,
}) {
  const campaign = await campaignRepository.get(campaignId);
  const { models: participations, meta } = await campaignParticipationRepository.findInfoByCampaignId(campaignId, page);

  if (campaign.isProfilesCollection) {
    return {
      models: participations.map((participation) => {
        return new ProfilesCollectionCampaignParticipation(participation);
      }),
      meta,
    };
  }

  const learningContent = await learningContentRepository.findByCampaignId(campaignId, locale);
  const knowledgeElementsByParticipations = await knowledgeElementSnapshotRepository.findByCampaignParticipationIds(
    participations.map((participation) => participation.id),
  );
  return {
    models: participations.map((participation) => {
      const tubes = computeTubes(campaignId, participation, learningContent, {
        [participation.id]: knowledgeElementsByParticipations[participation.id],
      });
      return new AssessmentCampaignParticipation({ ...participation, tubes });
    }),
    meta,
  };
};

function computeTubes(campaignId, campaignParticipation, learningContent, knowledgeElementsByParticipation) {
  if (campaignParticipation.status !== CampaignParticipationStatuses.SHARED) {
    return undefined;
  }

  const campaignResultLevelPerTubesAndCompetences = new CampaignResultLevelsPerTubesAndCompetences({
    campaignId,
    learningContent,
    knowledgeElementsByParticipation,
  });
  return campaignResultLevelPerTubesAndCompetences.levelsPerTube.map(
    ({ id, competenceId, competenceName, title, description, meanLevel, maxLevel }) => {
      return new TubeCoverage({
        id,
        competenceId,
        title,
        description,
        maxLevel,
        reachedLevel: meanLevel,
        competenceName,
      });
    },
  );
}

export { getCampaignParticipations };
