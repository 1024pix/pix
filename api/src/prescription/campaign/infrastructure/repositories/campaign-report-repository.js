import _ from 'lodash';

import * as injectedCombinedCourseDetailRepository from '../../../../quest/infrastructure/repositories/combined-course-details-repository.js';
import { CAMPAIGN_FEATURES } from '../../../../shared/domain/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import * as skillRepository from '../../../../shared/infrastructure/repositories/skill-repository.js';
import { filterByFullName } from '../../../../shared/infrastructure/utils/filter-utils.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';
import { TargetProfileForSpecifier } from '../../../target-profile/domain/read-models/TargetProfileForSpecifier.js';
import { CampaignReport } from '../../domain/read-models/CampaignReport.js';
import { getLatestParticipationSharedForOneLearner } from './helpers/get-latest-participation-shared-for-one-learner.js';

const { SHARED } = CampaignParticipationStatuses;

const get = async function (id) {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn('campaigns')
    .select({
      id: 'campaigns.id',
      name: 'campaigns.name',
      code: 'campaigns.code',
      title: 'campaigns.title',
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
      organizationId: 'campaigns.organizationId',
    })
    .select(
      knexConn.raw('ARRAY_AGG("badges"."id")  AS "badgeIds"'),
      knexConn.raw('ARRAY_AGG("stages"."id")  AS "stageIds"'),
      knexConn.raw(
        '(SELECT COUNT(*) from "campaign-participations" WHERE "campaign-participations"."campaignId" = "campaigns"."id" AND "campaign-participations"."isImproved" IS FALSE AND "campaign-participations"."deletedAt" IS NULL) AS "participationsCount"',
      ),
      knexConn.raw(
        '(SELECT count( distinct "organizationLearnerId" ) from "campaign-participations" WHERE "campaign-participations"."campaignId" = "campaigns"."id" AND "campaign-participations"."status" = \'SHARED\' AND "campaign-participations"."deletedAt" IS NULL) AS "sharedParticipationsCount"',
      ),
    )
    .join('users', 'users.id', 'campaigns.ownerId')
    .leftJoin('target-profiles', 'target-profiles.id', 'campaigns.targetProfileId')
    .leftJoin('badges', 'badges.targetProfileId', 'target-profiles.id')
    .leftJoin('stages', 'stages.targetProfileId', 'target-profiles.id')
    .where('campaigns.id', id)
    .whereNull('deletedAt')
    .groupBy('campaigns.id', 'users.id', 'target-profiles.id')
    .first();
  if (!result) {
    throw new NotFoundError(`La campagne d'id ${id} n'existe pas ou son accès est restreint`);
  }

  const externalIdFeature = await knexConn('campaign-features')
    .select('params')
    .join('features', 'features.id', 'featureId')
    .where({ campaignId: id, 'features.key': CAMPAIGN_FEATURES.EXTERNAL_ID.key })
    .first();

  const campaignReport = new CampaignReport({
    ...result,
    ...{ externalIdLabel: externalIdFeature?.params?.label, externalIdType: externalIdFeature?.params?.type },
    id,
  });

  if (campaignReport.isAssessment || campaignReport.isExam) {
    const skillIds = await knexConn('campaign_skills').where({ campaignId: id }).pluck('skillId');
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

const findMasteryRates = async (campaignId) => {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn
    .from('campaign-participations as cp')
    .select(['organizationLearnerId', getLatestParticipationSharedForOneLearner(knexConn, 'masteryRate', campaignId)])
    .groupBy('organizationLearnerId')
    .where('status', SHARED)
    .where('deletedAt', null)
    .where({ campaignId });

  return result.map(({ masteryRate }) => Number(masteryRate));
};

const findPaginatedFilteredByOrganizationId = async function ({
  organizationId,
  filter,
  page,
  userId,
  combinedCourseDetailsRepository = injectedCombinedCourseDetailRepository,
}) {
  const knexConn = DomainTransaction.getConnection();

  const combinedCourses = await combinedCourseDetailsRepository.findByOrganizationId({ organizationId });
  const campaignIdsToExclude = combinedCourses.flatMap((combinedCourse) => combinedCourse.campaignIds);

  const query = knexConn('campaigns')
    .distinct('campaigns.id')
    .select(
      'campaigns.id',
      'campaigns.name',
      'campaigns.code',
      'campaigns.type',
      'campaigns.archivedAt',
      'campaigns.createdAt',
      'users.id AS ownerId',
      'users.firstName AS ownerFirstName',
      'users.lastName AS ownerLastName',
      'target-profiles.name AS targetProfileName',
      knexConn.raw(
        'COUNT(*) FILTER (WHERE "campaign-participations"."id" IS NOT NULL AND "campaign-participations"."isImproved" IS FALSE AND "campaign-participations"."deletedAt" IS NULL) OVER (partition by "campaigns"."id") AS "participationsCount"',
      ),
      knexConn.raw(
        'COUNT(*) FILTER (WHERE "campaign-participations"."id" IS NOT NULL AND "campaign-participations"."status" = \'SHARED\' AND "campaign-participations"."isImproved" IS FALSE AND "campaign-participations"."deletedAt" IS NULL) OVER (partition by "campaigns"."id") AS "sharedParticipationsCount"',
      ),
    )
    .join('users', 'users.id', 'campaigns.ownerId')
    .leftJoin('target-profiles', 'target-profiles.id', 'campaigns.targetProfileId')
    .leftJoin('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
    .where('campaigns.organizationId', organizationId)
    .whereNull('campaigns.deletedAt')
    .whereNotIn('campaigns.id', campaignIdsToExclude)
    .orderBy('campaigns.createdAt', 'DESC');

  if (filter) {
    query.modify(_setSearchFiltersForQueryBuilder, filter, userId);
  }

  const { results, pagination } = await fetchPage({ queryBuilder: query, paginationParams: page });
  const atLeastOneCampaign = await knexConn('campaigns')
    .count('id')
    .where({ organizationId })
    .whereNull('deletedAt')
    .whereNotIn('campaigns.id', campaignIdsToExclude)
    .first();
  const hasCampaigns = atLeastOneCampaign.count > 0;

  const campaignReports = results.map((attributes) => new CampaignReport(attributes));

  return { models: campaignReports, meta: { ...pagination, hasCampaigns } };
};

const findAllPaginatedSummariesByOrganizationId = async function ({ organizationId, page }) {
  const knexConn = DomainTransaction.getConnection();

  const query = knexConn('campaigns')
    .select('id', 'name', 'code', 'type', 'createdAt', 'archivedAt')
    .where({ organizationId })
    .whereNull('deletedAt')
    .orderBy('createdAt', 'DESC');

  const { results, pagination } = await fetchPage({ queryBuilder: query, paginationParams: page });

  return { models: results, meta: pagination };
};

function _setSearchFiltersForQueryBuilder(qb, { name, ongoing = true, ownerName, isOwnedByMe }, userId) {
  if (name) {
    qb.whereILike('campaigns.name', `%${name}%`);
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

export { findAllPaginatedSummariesByOrganizationId, findMasteryRates, findPaginatedFilteredByOrganizationId, get };
