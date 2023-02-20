import chunk from 'lodash/chunk';
import bluebird from 'bluebird';
import { knex } from '../../../db/knex-database-connection';
import placementProfileService from '../../domain/services/placement-profile-service';
import CampaignProfilesCollectionParticipationSummary from '../../domain/read-models/CampaignProfilesCollectionParticipationSummary';
import competenceRepository from '../../infrastructure/repositories/competence-repository';
import constants from '../constants';
import { fetchPage } from '../utils/knex-utils';
import { filterByFullName } from '../utils/filter-utils';

const CampaignProfilesCollectionParticipationSummaryRepository = {
  async findPaginatedByCampaignId(campaignId, page, filters = {}) {
    const query = knex
      .select(
        'campaign-participations.id AS campaignParticipationId',
        'campaign-participations.userId AS userId',
        knex.raw('LOWER("organization-learners"."firstName") AS "lowerFirstName"'),
        knex.raw('LOWER("organization-learners"."lastName") AS "lowerLastName"'),
        'organization-learners.firstName AS firstName',
        'organization-learners.lastName AS lastName',
        'campaign-participations.participantExternalId',
        'campaign-participations.sharedAt',
        'campaign-participations.pixScore AS pixScore'
      )
      .from('campaign-participations')
      .join('organization-learners', 'organization-learners.id', 'campaign-participations.organizationLearnerId')
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
  },
};

async function _makeMemoizedGetPlacementProfileForUser(results) {
  const competences = await competenceRepository.listPixCompetencesOnly();

  const sharedResults = results.filter(({ sharedAt }) => sharedAt);

  const sharedResultsChunks = await bluebird.mapSeries(
    chunk(sharedResults, constants.CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING),
    (sharedResultsChunk) => {
      const sharedAtDatesByUsers = Object.fromEntries(
        sharedResultsChunk.map(({ userId, sharedAt }) => [userId, sharedAt])
      );
      return placementProfileService.getPlacementProfilesWithSnapshotting({
        userIdsAndDates: sharedAtDatesByUsers,
        allowExcessPixAndLevels: false,
        competences,
      });
    }
  );

  const placementProfiles = sharedResultsChunks.flat();

  return (userId) => placementProfiles.find((placementProfile) => placementProfile.userId === userId);
}

function _filterQuery(queryBuilder, filters) {
  if (filters.divisions) {
    const divisionsLowerCase = filters.divisions.map((division) => division.toLowerCase());
    queryBuilder.whereRaw('LOWER("organization-learners"."division") = ANY(:divisionsLowerCase)', {
      divisionsLowerCase,
    });
  }
  if (filters.groups) {
    const groupsLowerCase = filters.groups.map((group) => group.toLowerCase());
    queryBuilder.whereIn(knex.raw('LOWER("organization-learners"."group")'), groupsLowerCase);
  }
  if (filters.search) {
    filterByFullName(queryBuilder, filters.search, 'organization-learners.firstName', 'organization-learners.lastName');
  }
}

export default CampaignProfilesCollectionParticipationSummaryRepository;
