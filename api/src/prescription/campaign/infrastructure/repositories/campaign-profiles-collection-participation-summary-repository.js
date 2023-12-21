import chunk from 'lodash/chunk.js';
import isBoolean from 'lodash/isBoolean.js';

import bluebird from 'bluebird';
import { knex } from '../../../../../db/knex-database-connection.js';
import * as placementProfileService from '../../../../../lib/domain/services/placement-profile-service.js';
import { CampaignProfilesCollectionParticipationSummary } from '../../domain/read-models/CampaignProfilesCollectionParticipationSummary.js';
import * as competenceRepository from '../../../../shared/infrastructure/repositories/competence-repository.js';
import { constants } from '../../../../../lib/infrastructure/constants.js';
import { fetchPage } from '../../../../../lib/infrastructure/utils/knex-utils.js';
import { filterByFullName } from '../../../../../lib/infrastructure/utils/filter-utils.js';

const findPaginatedByCampaignId = async function (campaignId, page, filters = {}) {
  const query = knex
    .select(
      'campaign-participations.id AS campaignParticipationId',
      'campaign-participations.userId AS userId',
      knex.raw('LOWER("view-active-organization-learners"."firstName") AS "lowerFirstName"'),
      knex.raw('LOWER("view-active-organization-learners"."lastName") AS "lowerLastName"'),
      'view-active-organization-learners.firstName AS firstName',
      'view-active-organization-learners.lastName AS lastName',
      'campaign-participations.participantExternalId',
      'campaign-participations.sharedAt',
      'campaign-participations.pixScore AS pixScore',
    )
    .from('campaign-participations')
    .join(
      'view-active-organization-learners',
      'view-active-organization-learners.id',
      'campaign-participations.organizationLearnerId',
    )
    .where('campaign-participations.campaignId', '=', campaignId)
    .where('campaign-participations.isImproved', '=', false)
    .where('campaign-participations.deletedAt', 'IS', null)
    .whereRaw('"campaign-participations"."sharedAt" IS NOT NULL')
    .orderByRaw('?? ASC, ?? ASC', ['lowerLastName', 'lowerFirstName'])
    .modify(_filterQuery, filters);

  const { results, pagination } = await fetchPage(query, page);

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
};

async function _makeMemoizedGetPlacementProfileForUser(results) {
  const competences = await competenceRepository.listPixCompetencesOnly();

  const sharedResults = results.filter(({ sharedAt }) => sharedAt);

  const sharedResultsChunks = await bluebird.mapSeries(
    chunk(sharedResults, constants.CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING),
    (sharedResultsChunk) => {
      const sharedAtDatesByUsers = Object.fromEntries(
        sharedResultsChunk.map(({ userId, sharedAt }) => [userId, sharedAt]),
      );
      return placementProfileService.getPlacementProfilesWithSnapshotting({
        userIdsAndDates: sharedAtDatesByUsers,
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
