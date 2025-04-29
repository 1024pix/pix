import { knex } from '../../../../../db/knex-database-connection.js';
import { STAGE_ACQUISITIONS_TABLE_NAME } from '../../../../../db/migrations/20230721114848_create-stage_acquisitions-table.js';
import * as stageCollectionRepository from '../../../../../lib/infrastructure/repositories/user-campaign-results/stage-collection-repository.js';
import { StageAcquisitionCollection } from '../../../../shared/domain/models/user-campaign-results/StageAcquisitionCollection.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { PromiseUtils } from '../../../../shared/infrastructure/utils/promise-utils.js';
import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';
import { CampaignAssessmentParticipationResultMinimal } from '../../domain/read-models/CampaignAssessmentParticipationResultMinimal.js';

const { SHARED } = CampaignParticipationStatuses;

export const findPaginatedByCampaignId = async ({
  page = {},
  campaignId,
  filters = {},
  dependencies = { stageCollectionRepository },
}) => {
  const stageCollection = await dependencies.stageCollectionRepository.findStageCollection({ campaignId });
  const { results, pagination } = await fetchPage(getParticipantsResultList(campaignId, filters), page);
  const participations = await buildCampaignAssessmentParticipationResultList(results, stageCollection);

  return {
    participations,
    pagination,
  };
};

const getParticipantsResultList = (campaignId, filters) =>
  knex
    .with('campaign_participation_summaries', (qb) => getParticipations(qb, campaignId, filters))
    .select('*')
    .from('campaign_participation_summaries')
    .modify(filterByAcquiredBadges, filters)
    .modify(filterByUnacquiredBadges, filters)
    .modify(filterByStage, filters)
    .orderByRaw('LOWER(??) ASC, LOWER(??) ASC', ['lastName', 'firstName']);

const getParticipations = (qb, campaignId, filters) => {
  qb.select(
    'view-active-organization-learners.firstName',
    'view-active-organization-learners.lastName',
    'campaign-participations.participantExternalId',
    'campaign-participations.masteryRate',
    'campaign-participations.validatedSkillsCount',
    'campaign-participations.id AS campaignParticipationId',
    'campaign-participations.userId',
    knex('campaign-participations')
      .count()
      .whereRaw('"organizationLearnerId" = "view-active-organization-learners".id')
      .where('campaign-participations.campaignId', campaignId)
      .where('campaign-participations.status', SHARED)
      .whereNull('campaign-participations.deletedAt')
      .as('sharedResultCount'),
    knex('campaign-participations')
      .select('masteryRate')
      .whereRaw('"organizationLearnerId" = "view-active-organization-learners".id')
      .where('campaign-participations.campaignId', campaignId)
      .where('campaign-participations.status', SHARED)
      .whereNull('campaign-participations.deletedAt')
      .orderBy('sharedAt', 'desc')
      .offset(1)
      .limit(1)
      .as('previousMasteryRate'),
  )
    .distinctOn('campaign-participations.organizationLearnerId')
    .from('campaign-participations')
    .join(
      'view-active-organization-learners',
      'view-active-organization-learners.id',
      'campaign-participations.organizationLearnerId',
    )
    .where('campaign-participations.campaignId', '=', campaignId)
    .where('campaign-participations.status', '=', SHARED)
    .where('campaign-participations.deletedAt', 'IS', null)
    .modify(filterByDivisions, filters)
    .modify(filterByGroups, filters)

    .modify(addAcquiredBadgeIds, filters)
    .modify(addHighestAcquiredStageId, filters)

    .modify(filterBySearch, filters)

    .modify(orderBy, filters);
};

const filterByDivisions = (queryBuilder, filters) => {
  if (filters.divisions) {
    const divisionsLowerCase = filters.divisions.map((division) => division.toLowerCase());
    queryBuilder.whereRaw('LOWER("view-active-organization-learners"."division") = ANY(:divisionsLowerCase)', {
      divisionsLowerCase,
    });
  }
};

const filterByGroups = (queryBuilder, filters) => {
  if (filters.groups) {
    const groupsLowerCase = filters.groups.map((group) => group.toLowerCase());
    queryBuilder.whereIn(knex.raw('LOWER("view-active-organization-learners"."group")'), groupsLowerCase);
  }
};

const filterBySearch = (queryBuilder, filters) => {
  if (filters.search) {
    const search = filters.search.trim().toLowerCase();
    queryBuilder.where(function () {
      this.where(
        knex.raw(
          `CONCAT ("view-active-organization-learners"."firstName", ' ', "view-active-organization-learners"."lastName") <-> ?`,
          search,
        ),
        '<=',
        0.8,
      )
        .orWhereILike('view-active-organization-learners.lastName', `%${search}%`)
        .orWhereILike('view-active-organization-learners.firstName', `%${search}%`);
    });
  }
};

const addAcquiredBadgeIds = (queryBuilder, filters) => {
  if (filters.badges || filters.unacquiredBadges) {
    queryBuilder
      .select(knex.raw('ARRAY_AGG("badgeId") OVER (PARTITION BY "campaign-participations"."id") as badges_acquired'))
      .leftJoin('badge-acquisitions', 'badge-acquisitions.campaignParticipationId', 'campaign-participations.id')
      .distinctOn('campaign-participations.id', 'campaign-participations.organizationLearnerId');
  }
};

const addHighestAcquiredStageId = (queryBuilder, filters) => {
  if (filters.stages) {
    queryBuilder
      .select(
        knex.raw(`(SELECT "stages"."id"
        FROM stages
                 JOIN "stage-acquisitions" ON "stages"."id" = "stage-acquisitions"."stageId"
        WHERE "stage-acquisitions"."campaignParticipationId" = "campaign-participations"."id"
        ORDER BY CASE
             WHEN level = 0 THEN 0
             WHEN threshold = 0 THEN 0
             WHEN "isFirstSkill" = true THEN 1
             ELSE 2 END DESC,
         level DESC,
         threshold DESC
        LIMIT 1) as highest_stage_reached`),
      )
      .leftJoin('stage-acquisitions', 'stage-acquisitions.campaignParticipationId', 'campaign-participations.id')
      .distinctOn('campaign-participations.id', 'campaign-participations.organizationLearnerId');
  }
};

const orderBy = (queryBuilder, filters) => {
  const orderByClauses = [
    { column: 'campaign-participations.organizationLearnerId' },
    {
      column: 'campaign-participations.createdAt',
      order: 'desc',
      nulls: 'last',
    },
  ];
  if (filters.badges || filters.unacquiredBadges || filters.stages) {
    orderByClauses.unshift({ column: 'campaign-participations.id' });
  }
  queryBuilder.orderBy(orderByClauses);
};

const filterByStage = (queryBuilder, filters) => {
  if (filters.stages) {
    queryBuilder.whereIn('highest_stage_reached', filters.stages);
  }
};

const filterByAcquiredBadges = (queryBuilder, filters) => {
  if (filters.badges) {
    queryBuilder.whereRaw(':badgeIds <@ "badges_acquired"', { badgeIds: filters.badges });
  }
};

const filterByUnacquiredBadges = (queryBuilder, filters) => {
  if (filters.unacquiredBadges) {
    queryBuilder.whereRaw(':badgeIds && "badges_acquired" is false', {
      badgeIds: filters.unacquiredBadges,
    });
  }
};
/**
 *
 * @param results
 * @param {StageCollection} stageCollection
 *
 * @returns {Promise<Array>}
 */
const buildCampaignAssessmentParticipationResultList = async (results, stageCollection) =>
  PromiseUtils.mapSeries(results, async (result) => {
    const badges = await getAcquiredBadges(result.campaignParticipationId);

    if (!stageCollection.hasStage) {
      return new CampaignAssessmentParticipationResultMinimal({
        ...result,
        badges,
      });
    }

    const acquiredStages = await getAcquiredStages(result.campaignParticipationId);
    const acquiredStagesCollection = new StageAcquisitionCollection(stageCollection.stages, acquiredStages);

    return new CampaignAssessmentParticipationResultMinimal({
      ...result,
      reachedStage: acquiredStagesCollection.reachedStageNumber,
      totalStage: acquiredStagesCollection.totalNumberOfStages,
      prescriberTitle: acquiredStagesCollection.reachedStage.prescriberTitle,
      prescriberDescription: acquiredStagesCollection.reachedStage.prescriberDescription,
      badges,
    });
  });

const getAcquiredStages = async (campaignParticipationId) =>
  await knex(STAGE_ACQUISITIONS_TABLE_NAME).select('*').where({ campaignParticipationId });

const getAcquiredBadges = async (campaignParticipationId) =>
  await knex('badge-acquisitions')
    .select(['badges.id AS id', 'title', 'altMessage', 'imageUrl'])
    .join('badges', 'badges.id', 'badge-acquisitions.badgeId')
    .where({ campaignParticipationId: campaignParticipationId });
