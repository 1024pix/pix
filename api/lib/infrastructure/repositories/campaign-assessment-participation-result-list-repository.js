import bluebird from 'bluebird';
import { knex } from '../../../db/knex-database-connection';
import { fetchPage } from '../utils/knex-utils';
import campaignRepository from './campaign-repository';
import CampaignStages from '../../domain/read-models/campaign/CampaignStages';
import CampaignAssessmentParticipationResultMinimal from '../../domain/read-models/campaign-results/CampaignAssessmentParticipationResultMinimal';
import CampaignParticipationStatuses from '../../domain/models/CampaignParticipationStatuses';

const { SHARED } = CampaignParticipationStatuses;

async function findPaginatedByCampaignId({ page = {}, campaignId, filters = {} }) {
  const stages = await campaignRepository.findStages({ campaignId });
  const campaignStages = new CampaignStages({ stages });

  const { results, pagination } = await _getResultListPaginated(campaignId, campaignStages, filters, page);

  const participations = await _buildCampaignAssessmentParticipationResultList(results);
  return {
    participations,
    pagination,
  };
}
async function _getResultListPaginated(campaignId, campaignStages, filters, page) {
  const query = _getParticipantsResultList(campaignId, campaignStages, filters);
  return fetchPage(query, page);
}

function _getParticipantsResultList(campaignId, campaignStages, filters) {
  return knex
    .with('campaign_participation_summaries', (qb) => _getParticipations(qb, campaignId, campaignStages, filters))
    .select('*')
    .from('campaign_participation_summaries')
    .modify(_filterByBadgeAcquisitionsOut, filters)
    .orderByRaw('LOWER(??) ASC, LOWER(??) ASC', ['lastName', 'firstName']);
}

function _getParticipations(qb, campaignId, campaignStages, filters) {
  qb.select(
    'organization-learners.firstName',
    'organization-learners.lastName',
    'campaign-participations.participantExternalId',
    'campaign-participations.masteryRate',
    'campaign-participations.id AS campaignParticipationId',
    'campaign-participations.userId'
  )
    .from('campaign-participations')
    .join('organization-learners', 'organization-learners.id', 'campaign-participations.organizationLearnerId')
    .where('campaign-participations.campaignId', '=', campaignId)
    .where('campaign-participations.status', '=', SHARED)
    .where('campaign-participations.isImproved', '=', false)
    .where('campaign-participations.deletedAt', 'IS', null)
    .modify(_filterByDivisions, filters)
    .modify(_filterByGroups, filters)
    .modify(_addAcquiredBadgeids, filters)
    .modify(_filterByStage, campaignStages, filters)
    .modify(_filterBySearch, filters);
}

function _filterByDivisions(queryBuilder, filters) {
  if (filters.divisions) {
    const divisionsLowerCase = filters.divisions.map((division) => division.toLowerCase());
    queryBuilder.whereRaw('LOWER("organization-learners"."division") = ANY(:divisionsLowerCase)', {
      divisionsLowerCase,
    });
  }
}

function _filterByGroups(queryBuilder, filters) {
  if (filters.groups) {
    const groupsLowerCase = filters.groups.map((group) => group.toLowerCase());
    queryBuilder.whereIn(knex.raw('LOWER("organization-learners"."group")'), groupsLowerCase);
  }
}

function _filterBySearch(queryBuilder, filters) {
  if (filters.search) {
    const search = filters.search.trim().toLowerCase();
    queryBuilder.where(function () {
      this.where(
        knex.raw(`CONCAT ("organization-learners"."firstName", ' ', "organization-learners"."lastName") <-> ?`, search),
        '<=',
        0.8
      )
        .orWhereILike('organization-learners.lastName', `%${search}%`)
        .orWhereILike('organization-learners.firstName', `%${search}%`);
    });
  }
}

function _addAcquiredBadgeids(queryBuilder, filters) {
  if (filters.badges) {
    queryBuilder
      .select(knex.raw('ARRAY_AGG("badgeId") OVER (PARTITION BY "campaign-participations"."id") as badges_acquired'))
      .join('badge-acquisitions', 'badge-acquisitions.campaignParticipationId', 'campaign-participations.id')
      .distinct('campaign-participations.id');
  }
}

function _filterByBadgeAcquisitionsOut(queryBuilder, filters) {
  if (filters.badges) {
    queryBuilder.whereRaw(':badgeIds <@ "badges_acquired"', { badgeIds: filters.badges });
  }
}

function _filterByStage(queryBuilder, campaignStages, filters) {
  if (!filters.stages) return;

  const thresholdRateBoundaries = campaignStages.stageThresholdBoundaries
    .filter((boundary) => filters.stages.includes(boundary.id))
    .map((boundary) => ({
      id: boundary.id,
      from: boundary.from / 100,
      to: boundary.to / 100,
    }));
  queryBuilder.where((builder) => {
    thresholdRateBoundaries.forEach((boundary) => {
      builder.orWhereBetween('campaign-participations.masteryRate', [boundary.from, boundary.to]);
    });
  });
}

async function _buildCampaignAssessmentParticipationResultList(results) {
  return await bluebird.mapSeries(results, async (result) => {
    const badges = await getAcquiredBadges(result.campaignParticipationId);

    return new CampaignAssessmentParticipationResultMinimal({
      ...result,
      badges,
    });
  });
}

async function getAcquiredBadges(campaignParticipationId) {
  return await knex('badge-acquisitions')
    .select(['badges.id AS id', 'title', 'altMessage', 'imageUrl'])
    .join('badges', 'badges.id', 'badge-acquisitions.badgeId')
    .where({ campaignParticipationId: campaignParticipationId });
}

export default {
  findPaginatedByCampaignId,
};
