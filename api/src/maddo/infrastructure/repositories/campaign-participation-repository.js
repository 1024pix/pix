import { knex as knexDatamart } from '../../../../datamart/knex-database-connection.js';
import { knex } from '../../../../db/knex-database-connection.js';
import * as tubeRepository from '../../../shared/infrastructure/repositories/tube-repository.js';
import { CampaignParticipation } from '../../domain/models/CampaignParticipation.js';

export async function findByCampaignId(campaignId) {
  const rawCampaignParticipations = await knex
    .select(
      'id',
      'createdAt',
      'participantExternalId',
      'status',
      'sharedAt',
      'deletedAt',
      'deletedBy',
      'campaignId',
      'userId',
      'organizationLearnerId',
    )
    .from('campaign-participations')
    .where('campaignId', campaignId)
    .orderBy('id');

  const reachedLevelByTubes = await knexDatamart('campaign_participation_tube_reached_levels')
    .select('*')
    .whereIn(
      'campaign_participation_id',
      rawCampaignParticipations.map(({ id }) => id),
    );

  const tubeIds = new Set(reachedLevelByTubes.map(({ tube_id }) => tube_id));
  const tubes = await tubeRepository.findByRecordIds(tubeIds);

  return rawCampaignParticipations.map((rawCampaigns) => toDomain(rawCampaigns, reachedLevelByTubes, tubes));
}

function toDomain(rawCampaignParticipation, rawReachedLevelByTubes, tubes) {
  const tubeNamesById = _getTubeNamesById(tubes);

  const campaignParticipationReachedLevels = rawReachedLevelByTubes
    .filter(({ campaign_participation_id }) => rawCampaignParticipation.id === campaign_participation_id)
    .map(({ reached_level, tube_id }) => ({
      id: tube_id,
      name: tubeNamesById[tube_id],
      level: reached_level,
    }));

  return new CampaignParticipation({
    id: rawCampaignParticipation.id,
    createdAt: rawCampaignParticipation.createdAt,
    participantExternalId: rawCampaignParticipation.participantExternalId,
    status: rawCampaignParticipation.status,
    sharedAt: rawCampaignParticipation.sharedAt,
    campaignId: rawCampaignParticipation.campaignId,
    userId: rawCampaignParticipation.userId,
    organizationLearnerId: rawCampaignParticipation.organizationLearnerId,
    tubesReachedLevel: campaignParticipationReachedLevels.length ? campaignParticipationReachedLevels : undefined,
  });
}

function _getTubeNamesById(tubes) {
  return tubes.reduce((acc, curr) => {
    acc[curr.id] = curr.name;
    return acc;
  }, {});
}
