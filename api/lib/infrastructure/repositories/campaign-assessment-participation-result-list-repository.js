import bluebird from 'bluebird';
import { knex } from '../../../db/knex-database-connection.js';
import { fetchPage } from '../utils/knex-utils.js';
import * as stageRepository from './stage-repository.js';
import * as stageAcquisitionRepository from './stage-acquisition-repository.js';
import { CampaignAssessmentParticipationResultMinimal } from '../../domain/read-models/campaign-results/CampaignAssessmentParticipationResultMinimal.js';
import { CampaignParticipationStatuses } from '../../domain/models/CampaignParticipationStatuses.js';
import { StageCollection } from '../../domain/models/user-campaign-results/StageCollection.js';
import { compare } from '../../domain/services/stages/stage-and-stage-acquisition-comparison-service.js';

const { SHARED } = CampaignParticipationStatuses;

async function findPaginatedByCampaignId({ page = {}, campaignId, filters = {} }) {
  const stages = await stageRepository.getByCampaignId(campaignId);
  const acquiredStages = await stageAcquisitionRepository.getByCampaignId(campaignId);

  const stageCollection = await new StageCollection({ campaignId, stages });

  const { results, pagination } = await _getResultListPaginated(campaignId, stageCollection, filters, page);
  const participations = await _buildCampaignAssessmentParticipationResultList(results, stages, acquiredStages);

  return {
    participations,
    pagination,
  };
}
async function _getResultListPaginated(campaignId, stageCollection, filters, page) {
  const query = _getParticipantsResultList(campaignId, stageCollection, filters);
  return fetchPage(query, page);
}

function _getParticipantsResultList(campaignId, stageCollection, filters) {
  return knex
    .with('campaign_participation_summaries', (qb) => _getParticipations(qb, campaignId, stageCollection, filters))
    .select('*')
    .from('campaign_participation_summaries')
    .modify(_filterByBadgeAcquisitionsOut, filters)
    .orderByRaw('LOWER(??) ASC, LOWER(??) ASC', ['lastName', 'firstName']);
}

function _getParticipations(qb, campaignId, stageCollection, filters) {
  qb.select(
    'view-active-organization-learners.firstName',
    'view-active-organization-learners.lastName',
    'campaign-participations.participantExternalId',
    'campaign-participations.masteryRate',
    'campaign-participations.validatedSkillsCount',
    'campaign-participations.id AS campaignParticipationId',
    'campaign-participations.userId',
  )
    .from('campaign-participations')
    .join(
      'view-active-organization-learners',
      'view-active-organization-learners.id',
      'campaign-participations.organizationLearnerId',
    )
    .where('campaign-participations.campaignId', '=', campaignId)
    .where('campaign-participations.status', '=', SHARED)
    .where('campaign-participations.isImproved', '=', false)
    .where('campaign-participations.deletedAt', 'IS', null)
    .modify(_filterByDivisions, filters)
    .modify(_filterByGroups, filters)
    .modify(_addAcquiredBadgeIds, filters)
    .modify(_filterByStage, stageCollection, filters)
    .modify(_filterBySearch, filters);
}

function _filterByDivisions(queryBuilder, filters) {
  if (filters.divisions) {
    const divisionsLowerCase = filters.divisions.map((division) => division.toLowerCase());
    queryBuilder.whereRaw('LOWER("view-active-organization-learners"."division") = ANY(:divisionsLowerCase)', {
      divisionsLowerCase,
    });
  }
}

function _filterByGroups(queryBuilder, filters) {
  if (filters.groups) {
    const groupsLowerCase = filters.groups.map((group) => group.toLowerCase());
    queryBuilder.whereIn(knex.raw('LOWER("view-active-organization-learners"."group")'), groupsLowerCase);
  }
}

function _filterBySearch(queryBuilder, filters) {
  if (filters.search) {
    const search = filters.search.trim().toLowerCase();
    queryBuilder.where(function () {
      this.where(
        knex.raw(
          `CONCAT ("view-active-organization-learners"."firstName", ' ', "view-active-organization-learners"."lastName") <-> ?`,
          search,
        ),
        '<=',
        0.8,
      )
        .orWhereILike('view-active-organization-learners.lastName', `%${search}%`)
        .orWhereILike('view-active-organization-learners.firstName', `%${search}%`);
    });
  }
}

function _addAcquiredBadgeIds(queryBuilder, filters) {
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

function _filterByStage(queryBuilder, stageCollection, filters) {
  if (!filters.stages) return;
  const allBoundaries = stageCollection.getThresholdBoundaries();
  const boundariesForStagesInFilter = allBoundaries.filter(({ id }) => filters.stages.includes(id));
  queryBuilder.where((builder) => {
    boundariesForStagesInFilter.forEach((stageBoundary) => {
      if (stageCollection.isZeroStageId(stageBoundary.id) && stageCollection.hasFirstSkillStage) {
        builder.where('campaign-participations.validatedSkillsCount', '=', 0);
      } else if (stageCollection.isFirstSkillStageId(stageBoundary.id)) {
        builder.orWhere((subBuilder) => {
          subBuilder.where('campaign-participations.validatedSkillsCount', '>', 0);
          subBuilder.where('campaign-participations.masteryRate', '<=', stageBoundary.to / 100);
        });
      } else {
        builder.orWhereBetween('campaign-participations.masteryRate', [
          stageBoundary.from / 100,
          stageBoundary.to / 100,
        ]);
      }
    });
  });
}

async function _buildCampaignAssessmentParticipationResultList(results, stages, acquiredStages) {
  return await bluebird.mapSeries(results, async (result) => {
    const badges = await getAcquiredBadges(result.campaignParticipationId);

    const acquiredStagesForThisParticipation = acquiredStages.filter(
      ({ campaignParticipationId }) => campaignParticipationId === result.campaignParticipationId,
    );

    const acquisitionsInfo = compare(stages, acquiredStagesForThisParticipation);

    return new CampaignAssessmentParticipationResultMinimal({
      ...result,
      reachedStage: acquisitionsInfo.reachedStageNumber,
      totalStage: acquisitionsInfo.totalNumberOfStages,
      prescriberTitle: acquisitionsInfo.reachedStage?.prescriberTitle,
      prescriberDescription: acquisitionsInfo.reachedStage?.prescriberDescription,
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

export { findPaginatedByCampaignId };
