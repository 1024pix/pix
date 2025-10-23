import { knex } from '../../../../../db/knex-database-connection.js';
import {
  OrganizationLearnerParticipationStatuses,
  OrganizationLearnerParticipationTypes,
} from '../../../../quest/domain/models/OrganizationLearnerParticipation.js';
import { constants } from '../../../../shared/domain/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CampaignParticipationStatuses, CampaignTypes } from '../../../shared/domain/constants.js';
import { CampaignParticipationOverview } from '../../domain/read-models/CampaignParticipationOverview.js';

const findByUserIdWithFilters = async function ({ userId, states }) {
  const combinedCourseQueryBuilder = _getCombinedCoursesParticipations({ userId });

  const campaignQueryBuilder = _getQueryBuilder(function (qb) {
    qb.where('campaign-participations.userId', userId).whereNotExists(function () {
      this.select(knex.raw('1'))
        .from('quests')
        .crossJoin(knex.raw('jsonb_array_elements("successRequirements") as success_elem'))
        .whereNotNull('successRequirements')
        .andWhereRaw("(success_elem->'data'->'campaignId'->>'data')::integer = \"campaigns\".\"id\"");
    });
  });

  if (states && states.length > 0) {
    _filterByStates(campaignQueryBuilder, states);
    _filterByStates(combinedCourseQueryBuilder, states);
  }
  const campaignResults = await campaignQueryBuilder;
  const combinedCourseResults = await combinedCourseQueryBuilder;
  const results = [...combinedCourseResults, ...campaignResults];
  return results.map(
    (campaignParticipationOverview) => new CampaignParticipationOverview(campaignParticipationOverview),
  );
};

const findByOrganizationLearnerId = async ({ organizationLearnerId }) => {
  const results = await _getQueryBuilder((qb) => {
    qb.where('campaign-participations.organizationLearnerId', organizationLearnerId);
  });
  return results.map((result) => new CampaignParticipationOverview(result));
};

export { findByOrganizationLearnerId, findByUserIdWithFilters };

function _getQueryBuilder(callback) {
  const knexConn = DomainTransaction.getConnection();

  return knexConn
    .with('campaign-participation-overviews', (qb) => {
      qb.select({
        id: 'campaign-participations.id',
        createdAt: 'campaign-participations.createdAt',
        status: 'campaign-participations.status',
        sharedAt: 'campaign-participations.sharedAt',
        masteryRate: 'campaign-participations.masteryRate',
        validatedSkillsCount: 'campaign-participations.validatedSkillsCount',
        campaignCode: 'campaigns.code',
        campaignTitle: 'campaigns.title',
        campaignName: 'campaigns.name',
        targetProfileId: 'campaigns.targetProfileId',
        campaignArchivedAt: 'campaigns.archivedAt',
        organizationName: 'organizations.name',
        deletedAt: 'campaign-participations.deletedAt',
        participationState: _computeCampaignParticipationState(),
        campaignId: 'campaigns.id',
        isCampaignMultipleSendings: 'campaigns.multipleSendings',
        isOrganizationLearnerDisabled: 'view-active-organization-learners.isDisabled',
        campaignType: 'campaigns.type',
      })
        .from('campaign-participations')
        .join('campaigns', 'campaign-participations.campaignId', 'campaigns.id')
        .join('organizations', 'organizations.id', 'campaigns.organizationId')
        .leftJoin(
          'view-active-organization-learners',
          'view-active-organization-learners.id',
          'campaign-participations.organizationLearnerId',
        )
        .whereIn('campaigns.type', [CampaignTypes.ASSESSMENT, CampaignTypes.EXAM])
        .where('campaigns.isForAbsoluteNovice', false)
        .whereNot('organizations.id', constants.AUTONOMOUS_COURSES_ORGANIZATION_ID)
        .where('campaign-participations.isImproved', false)
        .where(callback);
    })
    .from('campaign-participation-overviews')
    .orderByRaw(_computeCampaignParticipationOrder())
    .orderByRaw(_sortEndedBySharedAt())
    .orderBy('createdAt', 'DESC');
}

function _getCombinedCoursesParticipations({ userId }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn
    .with('combined_course_participation_overviews', (qb) => {
      qb.select({
        id: 'organization_learner_participations.id',
        campaignCode: 'combined_courses.code',
        campaignTitle: 'combined_courses.name',
        organizationName: 'organizations.name',
        status: 'organization_learner_participations.status',
        createdAt: 'organization_learner_participations.createdAt',
        participationState: _computeCombinedCourseParticipationState(),
        updatedAt: 'organization_learner_participations.updatedAt',
        campaignType: knexConn.raw('?', OrganizationLearnerParticipationTypes.COMBINED_COURSE),
      })
        .from('organization_learner_participations')
        .join('combined_courses', function () {
          this.on(
            knex.raw('CAST(organization_learner_participations."referenceId" AS INTEGER)'),
            'combined_courses.id',
          );
        })
        .join('organizations', 'combined_courses.organizationId', 'organizations.id')
        .where('organization_learner_participations.type', OrganizationLearnerParticipationTypes.COMBINED_COURSE)
        .whereIn('organization_learner_participations.organizationLearnerId', function () {
          this.select('id').from('organization-learners').where('userId', userId);
        });
    })
    .from('combined_course_participation_overviews')
    .orderByRaw(_computeCombinedCourseParticipationOrder());
}

function _computeCampaignParticipationState() {
  return knex.raw(
    `
  CASE
    WHEN campaigns."archivedAt" IS NOT NULL THEN 'DISABLED'
    WHEN "campaign-participations"."deletedAt" IS NOT NULL THEN 'DISABLED'
    WHEN "campaign-participations"."status" = ? THEN 'ONGOING'
    WHEN "campaign-participations"."status" = ? THEN 'ENDED'
    ELSE 'TO_SHARE'
  END`,
    [CampaignParticipationStatuses.STARTED, CampaignParticipationStatuses.SHARED],
  );
}

function _computeCombinedCourseParticipationState() {
  return knex.raw(
    `
  CASE
    WHEN organization_learner_participations.status = ? THEN 'ONGOING'
    WHEN organization_learner_participations.status = ?  THEN 'ENDED'
  END`,
    [OrganizationLearnerParticipationStatuses.STARTED, OrganizationLearnerParticipationStatuses.COMPLETED],
  );
}

function _computeCampaignParticipationOrder() {
  return `
  CASE
    WHEN "participationState" = 'TO_SHARE' THEN 1
    WHEN "participationState" = 'ONGOING'  THEN 2
    WHEN "participationState" = 'ENDED'    THEN 3
    WHEN "participationState" = 'DISABLED' THEN 4
  END`;
}

function _computeCombinedCourseParticipationOrder() {
  return `
  CASE
    WHEN "participationState" = 'ONGOING'  THEN 1
    WHEN "participationState" = 'ENDED'    THEN 2
  END`;
}

function _sortEndedBySharedAt() {
  return `
  CASE
    WHEN "participationState" = 'ENDED' THEN "sharedAt"
    ELSE "createdAt"
  END DESC`;
}

function _filterByStates(queryBuilder, states) {
  queryBuilder.whereIn('participationState', states);
}
