const { knex } = require('../../../db/knex-database-connection.js');

const CampaignReport = require('../../domain/read-models/CampaignReport.js');
const TargetProfileForSpecifier = require('../../domain/read-models/campaign/TargetProfileForSpecifier.js');
const CampaignParticipationStatuses = require('../../domain/models/CampaignParticipationStatuses.js');
const { fetchPage } = require('../utils/knex-utils.js');
const { NotFoundError } = require('../../domain/errors.js');
const _ = require('lodash');
const { filterByFullName } = require('../utils/filter-utils.js');
const campaignRepository = require('./campaign-repository.js');

const { SHARED } = CampaignParticipationStatuses;

function _setSearchFiltersForQueryBuilder(qb, { name, ongoing = true, ownerName, isOwnedByMe }, userId) {
  if (name) {
    qb.whereILike('name', `%${name}%`);
  }
  if (ongoing) {
    qb.whereNull('campaigns.archivedAt');
  } else {
    qb.whereNotNull('campaigns.archivedAt');
  }
  if (ownerName) {
    filterByFullName(qb, ownerName, 'users.firstName', 'users.lastName');
  }
  if (isOwnedByMe) {
    qb.where('users.id', '=', userId);
  }
}

module.exports = {
  async get(id) {
    const result = await knex('campaigns')
      .select({
        id: 'campaigns.id',
        name: 'campaigns.name',
        code: 'campaigns.code',
        title: 'campaigns.title',
        idPixLabel: 'campaigns.idPixLabel',
        createdAt: 'campaigns.createdAt',
        customLandingPageText: 'campaigns.customLandingPageText',
        archivedAt: 'campaigns.archivedAt',
        type: 'campaigns.type',
        ownerId: 'users.id',
        ownerLastName: 'users.lastName',
        ownerFirstName: 'users.firstName',
        targetProfileId: 'target-profiles.id',
        targetProfileDescription: 'target-profiles.description',
        targetProfileName: 'target-profiles.name',
        multipleSendings: 'campaigns.multipleSendings',
      })
      .select(
        knex.raw('ARRAY_AGG("badges"."id")  AS "badgeIds"'),
        knex.raw('ARRAY_AGG("stages"."id")  AS "stageIds"'),
        knex.raw(
          '(SELECT COUNT(*) from "campaign-participations" WHERE "campaign-participations"."campaignId" = "campaigns"."id" AND "campaign-participations"."isImproved" IS FALSE AND "campaign-participations"."deletedAt" IS NULL) AS "participationsCount"'
        ),
        knex.raw(
          '(SELECT COUNT(*) from "campaign-participations" WHERE "campaign-participations"."campaignId" = "campaigns"."id" AND "campaign-participations"."status" = \'SHARED\' AND "campaign-participations"."isImproved" IS FALSE AND "campaign-participations"."deletedAt" IS NULL) AS "sharedParticipationsCount"'
        )
      )
      .join('users', 'users.id', 'campaigns.ownerId')
      .leftJoin('target-profiles', 'target-profiles.id', 'campaigns.targetProfileId')
      .leftJoin('badges', 'badges.targetProfileId', 'target-profiles.id')
      .leftJoin('stages', 'stages.targetProfileId', 'target-profiles.id')
      .where('campaigns.id', id)
      .groupBy('campaigns.id', 'users.id', 'target-profiles.id')
      .first();

    if (!result) {
      throw new NotFoundError(`La campagne d'id ${id} n'existe pas ou son accès est restreint`);
    }

    const skills = await campaignRepository.findSkills({ campaignId: id, filterByStatus: 'all' });

    const targetProfile = new TargetProfileForSpecifier({
      id: result.targetProfileId,
      name: result.targetProfileName,
      tubeCount: _.uniqBy(skills, 'tubeId').length,
      thematicResultCount: _.uniq(result.badgeIds).filter((id) => id).length,
      hasStage: result.stageIds.some((stage) => stage),
      description: result.targetProfileDescription,
    });

    return new CampaignReport({ ...result, id, targetProfileForSpecifier: targetProfile });
  },

  async findMasteryRates(campaignId) {
    const results = await knex('campaign-participations')
      .select('masteryRate')
      .where('isImproved', false)
      .andWhere('status', SHARED)
      .andWhere('deletedAt', null)
      .andWhere({ campaignId });
    return results.map((result) => Number(result.masteryRate));
  },

  async findPaginatedFilteredByOrganizationId({ organizationId, filter, page, userId }) {
    const query = knex('campaigns')
      .distinct('campaigns.id')
      .select(
        'campaigns.*',
        'users.id AS "ownerId"',
        'users.firstName AS ownerFirstName',
        'users.lastName AS ownerLastName',
        knex.raw(
          'COUNT(*) FILTER (WHERE "campaign-participations"."id" IS NOT NULL AND "campaign-participations"."isImproved" IS FALSE AND "campaign-participations"."deletedAt" IS NULL) OVER (partition by "campaigns"."id") AS "participationsCount"'
        ),
        knex.raw(
          'COUNT(*) FILTER (WHERE "campaign-participations"."id" IS NOT NULL AND "campaign-participations"."status" = \'SHARED\' AND "campaign-participations"."isImproved" IS FALSE AND "campaign-participations"."deletedAt" IS NULL) OVER (partition by "campaigns"."id") AS "sharedParticipationsCount"'
        )
      )
      .join('users', 'users.id', 'campaigns.ownerId')
      .leftJoin('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
      .where('campaigns.organizationId', organizationId)
      .modify(_setSearchFiltersForQueryBuilder, filter, userId)
      .orderBy('campaigns.createdAt', 'DESC');

    const { results, pagination } = await fetchPage(query, page);
    const atLeastOneCampaign = await knex('campaigns').select('id').where({ organizationId }).first(1);
    const hasCampaigns = Boolean(atLeastOneCampaign);

    const campaignReports = results.map((result) => new CampaignReport(result));
    return { models: campaignReports, meta: { ...pagination, hasCampaigns } };
  },
};
