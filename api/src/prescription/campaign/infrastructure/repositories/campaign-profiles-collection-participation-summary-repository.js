import bluebird from 'bluebird';
import chunk from 'lodash/chunk.js';
import isBoolean from 'lodash/isBoolean.js';

import { knex } from '../../../../../db/knex-database-connection.js';
import * as placementProfileService from '../../../../../lib/domain/services/placement-profile-service.js';
import { constants } from '../../../../../lib/infrastructure/constants.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import { filterByFullName } from '../../../../shared/infrastructure/utils/filter-utils.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { CampaignProfilesCollectionParticipationSummary } from '../../domain/read-models/CampaignProfilesCollectionParticipationSummary.js';

async function findPaginatedByCampaignId(campaignId, page = {}, filters = {}) {
  const { results, pagination } = await _getResultListPaginated(campaignId, filters, page);

  const getPlacementProfileForUser = await _makeMemoizedGetPlacementProfileForUser(results);

  const data = results.map((result) => {
    if (!result.sharedAt) {
      return new CampaignProfilesCollectionParticipationSummary(result);
    }

    const placementProfile = getPlacementProfileForUser(result.userId);

    return new CampaignProfilesCollectionParticipationSummary({
      ...result,
      certifiable: placementProfile.isCertifiable(),
      certifiableCompetencesCount: placementProfile.getCertifiableCompetencesCount(),
    });
  });

  return { data, pagination };
}

function _getResultListPaginated(campaignId, filters, page) {
  const query = _getParticipantsResultList(campaignId, filters);
  return fetchPage(query, page);
}

function _getParticipantsResultList(campaignId, filters) {
  return knex
    .with('campaign_participation_summaries', (qb) => _getParticipations(qb, campaignId, filters))
    .select('*')
    .from('campaign_participation_summaries')
    .orderByRaw('LOWER(??) ASC, LOWER(??) ASC', ['lastName', 'firstName']);
}

function _getParticipations(qb, campaignId, filters) {
  qb.select(
    'campaign-participations.id AS campaignParticipationId',
    'campaign-participations.userId AS userId',
    'view-active-organization-learners.firstName AS firstName',
    'view-active-organization-learners.lastName AS lastName',
    'campaign-participations.participantExternalId',
    'campaign-participations.sharedAt',
    'campaign-participations.pixScore AS pixScore',
  )
    .distinctOn('campaign-participations.organizationLearnerId')
    .from('campaign-participations')
    .join(
      'view-active-organization-learners',
      'view-active-organization-learners.id',
      'campaign-participations.organizationLearnerId',
    )
    .where('campaign-participations.campaignId', campaignId)
    .whereNull('campaign-participations.deletedAt')
    .whereNotNull('campaign-participations.sharedAt')
    .orderBy([
      { column: 'campaign-participations.organizationLearnerId' },
      {
        column: 'campaign-participations.createdAt',
        order: 'desc',
        nulls: 'last',
      },
    ])
    .modify(_filterQuery, filters);
}

async function _makeMemoizedGetPlacementProfileForUser(results) {
  const competences = await competenceRepository.listPixCompetencesOnly();

  const sharedResults = results.filter(({ sharedAt }) => sharedAt);

  const sharedResultsChunks = await bluebird.mapSeries(
    chunk(sharedResults, constants.CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING),
    (sharedResultsChunk) => {
      const userIdsAndDates = sharedResultsChunk.map(({ userId, sharedAt }) => {
        return { userId, sharedAt };
      });

      return placementProfileService.getPlacementProfilesWithSnapshotting({
        userIdsAndDates,
        allowExcessPixAndLevels: false,
        competences,
      });
    },
  );

  const placementProfiles = sharedResultsChunks.flat();

  return (userId) => placementProfiles.find((placementProfile) => placementProfile.userId === userId);
}

function _filterQuery(queryBuilder, filters) {
  if (filters.divisions) {
    const divisionsLowerCase = filters.divisions.map((division) => division.toLowerCase());
    queryBuilder.whereRaw('LOWER("view-active-organization-learners"."division") = ANY(:divisionsLowerCase)', {
      divisionsLowerCase,
    });
  }
  if (filters.groups) {
    const groupsLowerCase = filters.groups.map((group) => group.toLowerCase());
    queryBuilder.whereIn(knex.raw('LOWER("view-active-organization-learners"."group")'), groupsLowerCase);
  }
  if (filters.search) {
    filterByFullName(
      queryBuilder,
      filters.search,
      'view-active-organization-learners.firstName',
      'view-active-organization-learners.lastName',
    );
  }
  if (isBoolean(filters.certificability)) {
    queryBuilder.where('campaign-participations.isCertifiable', filters.certificability);
  }
}

export { findPaginatedByCampaignId };
