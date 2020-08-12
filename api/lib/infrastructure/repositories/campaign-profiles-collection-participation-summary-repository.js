const sumBy = require('lodash/sumBy');
const { knex } = require('../bookshelf');
const placementProfileService = require('../../domain/services/placement-profile-service');
const CampaignProfilesCollectionParticipationSummary = require('../../domain/read-models/CampaignProfilesCollectionParticipationSummary');
const { fetchPage } = require('../utils/knex-utils');

const CampaignProfilesCollectionParticipationSummaryRepository = {

  async findPaginatedByCampaignId(campaignId, page) {
    const query = knex
      .select(
        'campaign-participations.id AS campaignParticipationId',
        'users.id as userId',
        knex.raw('COALESCE (LOWER("schooling-registrations"."firstName"), LOWER("users"."firstName")) AS "lowerFirstName"'),
        knex.raw('COALESCE (LOWER("schooling-registrations"."lastName"), LOWER("users"."lastName")) AS "lowerLastName"'),
        knex.raw('COALESCE ("schooling-registrations"."firstName", "users"."firstName") AS "firstName"'),
        knex.raw('COALESCE ("schooling-registrations"."lastName", "users"."lastName") AS "lastName"'),
        'campaign-participations.participantExternalId',
        'campaign-participations.sharedAt',
      )
      .from('campaign-participations')
      .join('users', 'users.id', 'campaign-participations.userId')
      .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
      .leftJoin('schooling-registrations', function() {
        this.on({ 'campaign-participations.userId': 'schooling-registrations.userId' })
          .andOn({ 'campaigns.organizationId': 'schooling-registrations.organizationId' });
      })
      .where('campaign-participations.campaignId', '=', campaignId)
      .orderByRaw('?? ASC, ?? ASC', ['lowerLastName', 'lowerFirstName']);

    const { results, pagination } = await fetchPage(query, page);

    const data = await Promise.all(results.map(
      async (result) => {
        if (!result.sharedAt) {
          return new CampaignProfilesCollectionParticipationSummary(result);
        }

        const placementProfile = await placementProfileService.getPlacementProfile({
          userId: result.userId,
          limitDate: result.sharedAt,
          allowExcessPixAndLevels: false
        });

        return new CampaignProfilesCollectionParticipationSummary({
          ...result,
          pixScore: sumBy(placementProfile.userCompetences, 'pixScore'),
          certifiable: placementProfile.isCertifiable(),
          certifiableCompetencesCount: placementProfile.getCertifiableCompetencesCount(),
        });
      }
    ));

    return { data, pagination };
  }

};

module.exports = CampaignProfilesCollectionParticipationSummaryRepository;
