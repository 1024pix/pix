import _ from 'lodash';

import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CampaignParticipationStatuses } from '../../../../shared/domain/models/index.js';
import { CampaignReport } from '../../../../shared/domain/read-models/CampaignReport.js';
import * as skillRepository from '../../../../shared/infrastructure/repositories/skill-repository.js';
import { filterByFullName } from '../../../../shared/infrastructure/utils/filter-utils.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { TargetProfileForSpecifier } from '../../../target-profile/domain/read-models/TargetProfileForSpecifier.js';
import { getLatestParticipationSharedForOneLearner } from './helpers/get-latest-participation-shared-for-one-learner.js';

const { SHARED } = CampaignParticipationStatuses;

const get = async function (id) {
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
      areKnowledgeElementsResettable: 'target-profiles.areKnowledgeElementsResettable',
    })
    .select(
      knex.raw('ARRAY_AGG("badges"."id")  AS "badgeIds"'),
      knex.raw('ARRAY_AGG("stages"."id")  AS "stageIds"'),
      knex.raw(
        '(SELECT COUNT(*) from "campaign-participations" WHERE "campaign-participations"."campaignId" = "campaigns"."id" AND "campaign-participations"."isImproved" IS FALSE AND "campaign-participations"."deletedAt" IS NULL) AS "participationsCount"',
      ),
      knex.raw(
        '(SELECT count( distinct "organizationLearnerId" ) from "campaign-participations" WHERE "campaign-participations"."campaignId" = "campaigns"."id" AND "campaign-participations"."status" = \'SHARED\' AND "campaign-participations"."deletedAt" IS NULL) AS "sharedParticipationsCount"',
      ),
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

  const campaignReport = new CampaignReport({ ...result, id });

  if (campaignReport.isAssessment) {
    const skillIds = await knex('campaign_skills').where({ campaignId: id }).pluck('skillId');
    const skills = await skillRepository.findByRecordIds(skillIds);

    const targetProfile = new TargetProfileForSpecifier({
      id: result.targetProfileId,
      name: result.targetProfileName,
      tubeCount: _.uniqBy(skills, 'tubeId').length,
      thematicResultCount: _.uniq(result.badgeIds).filter((id) => id).length,
      hasStage: result.stageIds.some((stage) => stage),
      description: result.targetProfileDescription,
      areKnowledgeElementsResettable: result.areKnowledgeElementsResettable,
    });

    campaignReport.setTargetProfileInformation(targetProfile);
  }

  return campaignReport;
};

const findMasteryRatesAndValidatedSkillsCount = async function (campaignId) {
  const results = await knex
    .from('campaign-participations as cp')
    .select([
      'organizationLearnerId',
      getLatestParticipationSharedForOneLearner(knex, 'masteryRate', campaignId),
      getLatestParticipationSharedForOneLearner(knex, 'validatedSkillsCount', campaignId),
    ])
    .groupBy('organizationLearnerId')
    .where('status', SHARED)
    .where('deletedAt', null)
    .where({ campaignId });

  const aggregatedResults = {
    masteryRates: [],
    validatedSkillsCounts: [],
  };

  results.forEach((result) => {
    aggregatedResults.masteryRates.push(Number(result.masteryRate));
    aggregatedResults.validatedSkillsCounts.push(Number(result.validatedSkillsCount));
  });

  return aggregatedResults;
};

const findPaginatedFilteredByOrganizationId = async function ({ organizationId, filter = {}, page, userId }) {
  const query = knex('campaigns')
    .distinct('campaigns.id')
    .select(
      'campaigns.*',
      'users.id AS "ownerId"',
      'users.firstName AS ownerFirstName',
      'users.lastName AS ownerLastName',
      knex.raw(
        'COUNT(*) FILTER (WHERE "campaign-participations"."id" IS NOT NULL AND "campaign-participations"."isImproved" IS FALSE AND "campaign-participations"."deletedAt" IS NULL) OVER (partition by "campaigns"."id") AS "participationsCount"',
      ),
      knex.raw(
        'COUNT(*) FILTER (WHERE "campaign-participations"."id" IS NOT NULL AND "campaign-participations"."status" = \'SHARED\' AND "campaign-participations"."isImproved" IS FALSE AND "campaign-participations"."deletedAt" IS NULL) OVER (partition by "campaigns"."id") AS "sharedParticipationsCount"',
      ),
    )
    .join('users', 'users.id', 'campaigns.ownerId')
    .leftJoin('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
    .where('campaigns.organizationId', organizationId)
    .whereNull('campaigns.deletedAt')
    .modify(_setSearchFiltersForQueryBuilder, filter, userId)
    .orderBy('campaigns.createdAt', 'DESC');

  const { results, pagination } = await fetchPage(query, page);
  const atLeastOneCampaign = await knex('campaigns')
    .select('id')
    .where({ organizationId })
    .whereNull('deletedAt')
    .first(1);
  const hasCampaigns = Boolean(atLeastOneCampaign);

  const campaignReports = results.map((result) => new CampaignReport(result));
  return { models: campaignReports, meta: { ...pagination, hasCampaigns } };
};

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

export { findMasteryRatesAndValidatedSkillsCount, findPaginatedFilteredByOrganizationId, get };
