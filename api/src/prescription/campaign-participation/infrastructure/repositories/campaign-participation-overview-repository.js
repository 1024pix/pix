import {
  OrganizationLearnerParticipationStatuses,
  OrganizationLearnerParticipationTypes,
} from '../../../../quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import { constants } from '../../../../shared/domain/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CampaignParticipationStatuses, CampaignTypes } from '../../../shared/domain/constants.js';
import { CampaignParticipationOverview } from '../../domain/read-models/CampaignParticipationOverview.js';

const findByUserIdWithFilters = async function ({ userId, states }) {
  const knexConn = DomainTransaction.getConnection();

  const combinedCourseQueryBuilder = _getCombinedCoursesParticipations({ userId });

  const campaignQueryBuilder = _getQueryBuilder(function (qb) {
    qb.where('campaign-participations.userId', userId).whereNotExists(function () {
      this.select(knexConn.raw('1'))
        .from('quests')
        .join('combined_courses', 'combined_courses.questId', 'quests.id')
        .whereIn('combined_courses.organizationId', function () {
          this.select('organizationId').from('organization-learners').where('userId', userId);
        })
        .crossJoin(knexConn.raw('jsonb_array_elements("successRequirements") as success_elem'))
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

const findByOrganizationLearnerIds = async (organizationLearnerIds) => {
  const results = await _getQueryBuilder((qb) => {
    qb.whereIn('campaign-participations.organizationLearnerId', organizationLearnerIds);
  });
  return results.reduce((participationsByLearner, campaignParticipation) => {
    const organizationLearnerId = campaignParticipation.organizationLearnerId;
    const campaignParticipationOverview = new CampaignParticipationOverview(campaignParticipation);

    if (!participationsByLearner.has(organizationLearnerId)) participationsByLearner.set(organizationLearnerId, []);

    participationsByLearner.get(organizationLearnerId).push(campaignParticipationOverview);

    return participationsByLearner;
  }, new Map());
};

export { findByOrganizationLearnerId, findByOrganizationLearnerIds, findByUserIdWithFilters };

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
        organizationLearnerId: 'view-active-organization-learners.id',
        deletedAt: 'campaign-participations.deletedAt',
        participationState: _computeCampaignParticipationState(knexConn),
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
        participationState: _computeCombinedCourseParticipationState(knexConn),
        updatedAt: 'organization_learner_participations.updatedAt',
        campaignType: knexConn.raw('?', OrganizationLearnerParticipationTypes.COMBINED_COURSE),
      })
        .from('organization_learner_participations')
        .join('combined_courses', function () {
          this.on(
            knexConn.raw('CAST(organization_learner_participations."referenceId" AS INTEGER)'),
            'combined_courses.id',
          );
        })
        .join('organizations', 'combined_courses.organizationId', 'organizations.id')
        .where('organization_learner_participations.type', OrganizationLearnerParticipationTypes.COMBINED_COURSE)
        .whereNull('organization_learner_participations.deletedAt')
        .whereIn('organization_learner_participations.organizationLearnerId', function () {
          this.select('id').from('organization-learners').where('userId', userId);
        });
    })
    .from('combined_course_participation_overviews')
    .orderByRaw(_computeCombinedCourseParticipationOrder());
}

function _computeCampaignParticipationState(knexConn) {
  return knexConn.raw(
    `
  CASE
    WHEN campaigns."archivedAt" IS NOT NULL THEN 'DISABLED'
    WHEN "campaign-participations"."deletedAt" IS NOT NULL THEN 'DISABLED'
    WHEN "campaign-participations"."status" = ? THEN 'ONGOING'
    WHEN "campaign-participations"."status" = ? THEN 'ENDED'
  END`,
    [CampaignParticipationStatuses.STARTED, CampaignParticipationStatuses.SHARED],
  );
}

function _computeCombinedCourseParticipationState(knexConn) {
  return knexConn.raw(
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
    WHEN "participationState" = 'ONGOING'  THEN 1
    WHEN "participationState" = 'ENDED'    THEN 2
    WHEN "participationState" = 'DISABLED' THEN 3
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
