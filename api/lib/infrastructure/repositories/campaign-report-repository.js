const { knex } = require('../bookshelf');

const CampaignReport = require('../../domain/read-models/CampaignReport');
const TargetProfileForSpecifier = require('../../domain/read-models/campaign/TargetProfileForSpecifier');
const CampaignParticipation = require('../../domain/models/CampaignParticipation');
const { fetchPage } = require('../utils/knex-utils');
const { NotFoundError } = require('../../domain/errors');
const _ = require('lodash');

const skillDataSource = require('../datasources/learning-content/skill-datasource');

const { SHARED } = CampaignParticipation.statuses;

function _setSearchFiltersForQueryBuilder(qb, { name, ongoing = true, ownerName }) {
  if (name) {
    qb.whereRaw('LOWER("name") LIKE ?', `%${name.toLowerCase()}%`);
  }
  if (ongoing) {
    qb.whereNull('campaigns.archivedAt');
  } else {
    qb.whereNotNull('campaigns.archivedAt');
  }
  if (ownerName) {
    qb.whereRaw('(LOWER("users"."firstName") LIKE ? OR LOWER("users"."lastName") LIKE ?)', [
      `%${ownerName.toLowerCase()}%`,
      `%${ownerName.toLowerCase()}%`,
    ]);
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
        creatorId: 'users.id',
        creatorLastName: 'users.lastName',
        creatorFirstName: 'users.firstName',
        targetProfileId: 'target-profiles.id',
        targetProfileDescription: 'target-profiles.description',
        targetProfileName: 'target-profiles.name',
      })
      .select(
        knex.raw('ARRAY_AGG("skillId") AS "skillIds"'),
        knex.raw('ARRAY_AGG("badges"."id")  AS "badgeIds"'),
        knex.raw('ARRAY_AGG("stages"."id")  AS "stageIds"'),
        knex.raw(
          '(SELECT COUNT(*) from "campaign-participations" WHERE "campaign-participations"."campaignId" = "campaigns"."id" AND "campaign-participations"."isImproved" IS FALSE) AS "participationsCount"'
        ),
        knex.raw(
          '(SELECT COUNT(*) from "campaign-participations" WHERE "campaign-participations"."campaignId" = "campaigns"."id" AND "campaign-participations"."status" = \'SHARED\' AND "campaign-participations"."isImproved" IS FALSE) AS "sharedParticipationsCount"'
        )
      )
      .join('users', 'users.id', 'campaigns.creatorId')
      .leftJoin('target-profiles', 'target-profiles.id', 'campaigns.targetProfileId')
      .leftJoin('badges', 'badges.targetProfileId', 'target-profiles.id')
      .leftJoin('stages', 'stages.targetProfileId', 'target-profiles.id')
      .leftJoin('target-profiles_skills', 'target-profiles_skills.targetProfileId', 'campaigns.targetProfileId')
      .where('campaigns.id', id)
      .groupBy('campaigns.id', 'users.id', 'target-profiles.id')
      .first();

    if (!result) {
      throw new NotFoundError(`La campagne d'id ${id} n'existe pas ou son accès est restreint`);
    }

    const skills = await skillDataSource.findByRecordIds(result.skillIds);

    const targetProfile = new TargetProfileForSpecifier({
      id: result.targetProfileId,
      name: result.targetProfileName,
      skills,
      thematicResults: _.uniq(result.badgeIds).filter((id) => id),
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
      .andWhere({ campaignId });
    return results.map((result) => Number(result.masteryRate));
  },

  async findPaginatedFilteredByOrganizationId({ organizationId, filter, page }) {
    const query = knex('campaigns')
      .distinct('campaigns.id')
      .select(
        'campaigns.*',
        'users.id AS "ownerId"',
        'users.firstName AS ownerFirstName',
        'users.lastName AS ownerLastName',
        knex.raw(
          'COUNT(*) FILTER (WHERE "campaign-participations"."id" IS NOT NULL AND "campaign-participations"."isImproved" IS FALSE) OVER (partition by "campaigns"."id") AS "participationsCount"'
        ),
        knex.raw(
          'COUNT(*) FILTER (WHERE "campaign-participations"."id" IS NOT NULL AND "campaign-participations"."status" = \'SHARED\' AND "campaign-participations"."isImproved" IS FALSE) OVER (partition by "campaigns"."id") AS "sharedParticipationsCount"'
        )
      )
      .join('users', 'users.id', 'campaigns.ownerId')
      .leftJoin('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
      .where('campaigns.organizationId', organizationId)
      .modify(_setSearchFiltersForQueryBuilder, filter)
      .orderBy('campaigns.createdAt', 'DESC');

    const { results, pagination } = await fetchPage(query, page);
    const atLeastOneCampaign = await knex('campaigns').select('id').where({ organizationId }).first(1);
    const hasCampaigns = Boolean(atLeastOneCampaign);

    const campaignReports = results.map((result) => new CampaignReport(result));
    return { models: campaignReports, meta: { ...pagination, hasCampaigns } };
  },
};
