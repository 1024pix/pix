const { knex } = require('../../../db/knex-database-connection');
const { fetchPage } = require('../utils/knex-utils');
const SupOrganizationParticipant = require('../../domain/read-models/SupOrganizationParticipant');
const CampaignTypes = require('../../domain/models/CampaignTypes');
const CampaignParticipationStatuses = require('../../domain/models/CampaignParticipationStatuses');

function _setFilters(qb, { lastName, firstName, studentNumber, groups } = {}) {
  if (lastName) {
    qb.whereRaw('LOWER("organization-learners"."lastName") LIKE ?', `%${lastName.toLowerCase()}%`);
  }
  if (firstName) {
    qb.whereRaw('LOWER("organization-learners"."firstName") LIKE ?', `%${firstName.toLowerCase()}%`);
  }
  if (studentNumber) {
    qb.whereRaw('LOWER("organization-learners"."studentNumber") LIKE ?', `%${studentNumber.toLowerCase()}%`);
  }
  if (groups) {
    qb.whereIn(
      knex.raw('LOWER("organization-learners"."group")'),
      groups.map((group) => group.toLowerCase())
    );
  }
}

function _buildIsCertifiable(queryBuilder, organizationId) {
  queryBuilder
    .distinct('organization-learners.id')
    .select([
      'organization-learners.id as organizationLearnerId',
      knex.raw(
        'FIRST_VALUE("isCertifiable") OVER(PARTITION BY "organization-learners"."id" ORDER BY "campaign-participations"."sharedAt" DESC) AS "isCertifiable"'
      ),
    ])
    .from('organization-learners')
    .join('campaign-participations', 'organization-learners.id', 'campaign-participations.organizationLearnerId')
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .where('campaign-participations.status', CampaignParticipationStatuses.SHARED)
    .where('campaigns.type', CampaignTypes.PROFILES_COLLECTION)
    .where('organization-learners.organizationId', organizationId)
    .where('campaigns.organizationId', organizationId)
    .where('campaign-participations.deletedAt', null);
}

module.exports = {
  async findPaginatedFilteredSupParticipants({ organizationId, filter, page = {} }) {
    const { totalSupParticipants } = await knex
      .count('id', { as: 'totalSupParticipants' })
      .from('organization-learners')
      .where({ organizationId: organizationId, isDisabled: false })
      .first();

    const query = knex
      .with('subquery', (qb) => _buildIsCertifiable(qb, organizationId))
      .distinct('organization-learners.id')
      .select([
        'organization-learners.id',
        'organization-learners.firstName',
        'organization-learners.lastName',
        knex.raw('LOWER("organization-learners"."firstName") AS "lowerFirstName"'),
        knex.raw('LOWER("organization-learners"."lastName") AS "lowerLastName"'),
        'organization-learners.birthdate',
        'organization-learners.group',
        'organization-learners.studentNumber',
        'organization-learners.organizationId',
        'subquery.isCertifiable',
        knex.raw(
          'FIRST_VALUE("name") OVER(PARTITION BY "organization-learners"."id" ORDER BY "campaign-participations"."createdAt" DESC) AS "campaignName"'
        ),
        knex.raw(
          'FIRST_VALUE("campaign-participations"."status") OVER(PARTITION BY "organization-learners"."id" ORDER BY "campaign-participations"."createdAt" DESC) AS "participationStatus"'
        ),
        knex.raw(
          'FIRST_VALUE("type") OVER(PARTITION BY "organization-learners"."id" ORDER BY "campaign-participations"."createdAt" DESC) AS "campaignType"'
        ),
        knex.raw(
          'COUNT(*) FILTER (WHERE "campaign-participations"."id" IS NOT NULL) OVER(PARTITION BY "organization-learners"."id") AS "participationCount"'
        ),
        knex.raw(
          'max("campaign-participations"."createdAt") OVER(PARTITION BY "organization-learners"."id") AS "lastParticipationDate"'
        ),
      ])
      .from('organization-learners')
      .leftJoin('subquery', 'subquery.organizationLearnerId', 'organization-learners.id')
      .leftJoin('campaign-participations', 'campaign-participations.organizationLearnerId', 'organization-learners.id')
      .leftJoin('campaigns', function () {
        this.on('campaigns.id', 'campaign-participations.campaignId').andOn(
          'campaigns.organizationId',
          'organization-learners.organizationId'
        );
      })
      .where(function (qb) {
        qb.where({ 'campaign-participations.id': null });
        qb.orWhere({
          'campaign-participations.isImproved': false,
          'campaign-participations.deletedAt': null,
        });
      })
      .where('organization-learners.isDisabled', false)
      .where('organization-learners.organizationId', organizationId)
      .modify(_setFilters, filter)
      .orderByRaw('?? ASC, ?? ASC', ['lowerLastName', 'lowerFirstName']);

    const { results, pagination } = await fetchPage(query, page);

    const supOrganizationParticipants = results.map((result) => {
      return new SupOrganizationParticipant({ ...result });
    });
    return {
      data: supOrganizationParticipants,
      meta: { ...pagination, participantCount: totalSupParticipants },
    };
  },
};
