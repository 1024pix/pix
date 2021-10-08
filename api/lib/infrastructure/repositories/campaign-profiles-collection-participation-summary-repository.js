const chunk = require('lodash/chunk');
const bluebird = require('bluebird');
const { knex } = require('../bookshelf');
const placementProfileService = require('../../domain/services/placement-profile-service');
const CampaignProfilesCollectionParticipationSummary = require('../../domain/read-models/CampaignProfilesCollectionParticipationSummary');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const constants = require('../constants');
const { fetchPage } = require('../utils/knex-utils');

const CampaignProfilesCollectionParticipationSummaryRepository = {
  async findPaginatedByCampaignId(campaignId, page, filters = {}) {
    const query = knex
      .select(
        'campaign-participations.id AS campaignParticipationId',
        'users.id as userId',
        knex.raw(
          'COALESCE (LOWER("schooling-registrations"."firstName"), LOWER("users"."firstName")) AS "lowerFirstName"'
        ),
        knex.raw(
          'COALESCE (LOWER("schooling-registrations"."lastName"), LOWER("users"."lastName")) AS "lowerLastName"'
        ),
        knex.raw('COALESCE ("schooling-registrations"."firstName", "users"."firstName") AS "firstName"'),
        knex.raw('COALESCE ("schooling-registrations"."lastName", "users"."lastName") AS "lastName"'),
        'campaign-participations.participantExternalId',
        'campaign-participations.sharedAt',
        'campaign-participations.pixScore AS pixScore'
      )
      .from('campaign-participations')
      .join('users', 'users.id', 'campaign-participations.userId')
      .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
      .leftJoin('schooling-registrations', function () {
        this.on({ 'campaign-participations.userId': 'schooling-registrations.userId' }).andOn({
          'campaigns.organizationId': 'schooling-registrations.organizationId',
        });
      })
      .where('campaign-participations.campaignId', '=', campaignId)
      .where('campaign-participations.isImproved', '=', false)
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

function _filterQuery(qb, filters) {
  if (filters.divisions) {
    const divisionsLowerCase = filters.divisions.map((division) => division.toLowerCase());
    qb.whereRaw('LOWER("schooling-registrations"."division") = ANY(:divisionsLowerCase)', { divisionsLowerCase });
  }
}

module.exports = CampaignProfilesCollectionParticipationSummaryRepository;
