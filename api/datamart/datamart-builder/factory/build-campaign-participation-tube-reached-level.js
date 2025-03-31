import { datamartBuffer } from '../datamart-buffer.js';

export function buildCampaignParticipationTubeReachedLevel({
  id = datamartBuffer.getNextId(),
  tubeId = 'tube1wd1nle2n11e2',
  campaignParticipationId = 1000,
  reachedLevel = 4,
} = {}) {
  datamartBuffer.pushInsertable({
    tableName: 'campaign_participation_tube_reached_levels',
    values: {
      id,
      tube_id: tubeId,
      campaign_participation_id: campaignParticipationId,
      reached_level: reachedLevel,
    },
  });

  return {
    id,
    tubeId,
    campaignParticipationId,
    reachedLevel,
  };
}
