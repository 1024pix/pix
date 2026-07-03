import { OrganizationLearnerParticipationTypes } from '../../../../quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import { config } from '../../../../shared/config.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { Assessment } from '../../../../shared/domain/models/Assessment.js';
import * as knowledgeElementRepository from '../../../../shared/infrastructure/repositories/knowledge-element-repository.js';
import { batchUpdate, fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { Campaign } from '../../../campaign/domain/models/Campaign.js';
import { CampaignParticipationInfo } from '../../../campaign/domain/read-models/CampaignParticipationInfo.js';
import * as campaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
import * as knowledgeElementSnapshotRepository from '../../../campaign/infrastructure/repositories/knowledge-element-snapshot-repository.js';
import { CampaignParticipationStatuses, CampaignTypes } from '../../../shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../shared/domain/models/KnowledgeElementCollection.js';
import { CampaignParticipation } from '../../domain/models/CampaignParticipation.js';
import { AvailableCampaignParticipation } from '../../domain/read-models/AvailableCampaignParticipation.js';
import { OrganizationLearnerCampaignParticipation } from '../../domain/read-models/OrganizationLearnerCampaignParticipation.js';

const { STARTED, SHARED } = CampaignParticipationStatuses;

const updateWithSnapshot = async function (campaignParticipation) {
  const knexConn = DomainTransaction.getConnection();

  await knexConn('campaign-participations')
    .where({ id: campaignParticipation.id })
    .update({ sharedAt: campaignParticipation.sharedAt, status: campaignParticipation.status });

  const campaign = await campaignRepository.getByCampaignParticipationId(campaignParticipation.id);
  if (campaign.isExam) {
    return;
  }
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({
    userId: campaignParticipation.userId,
    limitDate: campaignParticipation.sharedAt,
  });
  await knowledgeElementSnapshotRepository.save({
    snapshot: new KnowledgeElementCollection(knowledgeElements).toSnapshot(),
    campaignParticipationId: campaignParticipation.id,
  });
};

const getLocked = async function (id) {
  const knexConn = DomainTransaction.getConnection();

  const campaignParticipationDTO = await knexConn.from('campaign-participations').forUpdate().where({ id }).first();
  const campaignDTO = await knexConn.from('campaigns').where({ id: campaignParticipationDTO.campaignId }).first();
  const assessmentDTOs = await knexConn.from('assessments').where({ campaignParticipationId: id });
  const campaign = new Campaign(campaignDTO);
  return new CampaignParticipation({
    ...campaignParticipationDTO,
    campaign,
    assessments: assessmentDTOs.map((assessmentDTO) => new Assessment({ ...assessmentDTO, campaign })),
  });
};

const get = async function (id) {
  const knexConn = DomainTransaction.getConnection();

  const campaignParticipationDTO = await knexConn.from('campaign-participations').where({ id }).first();
  const campaignDTO = await knexConn.from('campaigns').where({ id: campaignParticipationDTO.campaignId }).first();
  const assessmentDTOs = await knexConn.from('assessments').where({ campaignParticipationId: id });
  const campaign = new Campaign(campaignDTO);
  return new CampaignParticipation({
    ...campaignParticipationDTO,
    campaign,
    assessments: assessmentDTOs.map((assessmentDTO) => new Assessment({ ...assessmentDTO, campaign })),
  });
};

const getByCampaignIds = async function (campaignIds, { withDeletedParticipation = false } = {}) {
  const knexConn = DomainTransaction.getConnection();
  const queryBuilder = knexConn('campaign-participations').whereIn('campaignId', campaignIds);

  if (!withDeletedParticipation) queryBuilder.whereNull('deletedAt');

  const campaignParticipations = await queryBuilder;

  return campaignParticipations.map((campaignParticipation) => new CampaignParticipation(campaignParticipation));
};

const getAllCampaignParticipationsInCampaignForASameLearner = async function ({
  campaignId,
  campaignParticipationId,
  keepPreviousDeleted = false,
}) {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn('campaign-participations')
    .select('organizationLearnerId')
    .where({ id: campaignParticipationId, campaignId })
    .first();

  if (!result) {
    throw new NotFoundError(
      `There is no campaign participation with the id "${campaignParticipationId}" for the campaign wih the id "${campaignId}"`,
    );
  }

  const queryBuilder = knexConn('campaign-participations').where({
    campaignId,
    organizationLearnerId: result.organizationLearnerId,
  });

  if (!keepPreviousDeleted) queryBuilder.whereNull('deletedAt').whereNull('deletedBy');
  else queryBuilder.whereNotNull('deletedAt');

  const campaignParticipations = await queryBuilder;

  return campaignParticipations.map((campaignParticipation) => new CampaignParticipation(campaignParticipation));
};

const getCampaignParticipationsForOrganizationLearner = async function ({ organizationLearnerId, campaignId }) {
  const knexConn = DomainTransaction.getConnection();
  const campaignParticipations = await knexConn('campaign-participations')
    .where({
      campaignId,
      organizationLearnerId,
    })
    .whereNull('deletedAt')
    .whereNull('deletedBy')
    .orderBy('createdAt', 'desc');

  return campaignParticipations.map(
    (campaignParticipation) => new AvailableCampaignParticipation(campaignParticipation),
  );
};

const getAllCampaignParticipationsForOrganizationLearnerIds = async function ({
  organizationLearnerIds,
  withDeletedParticipation = false,
} = {}) {
  const knexConn = DomainTransaction.getConnection();
  const queryBuilder = knexConn('campaign-participations')
    .whereIn('organizationLearnerId', organizationLearnerIds)
    .orderBy('createdAt', 'desc');

  if (!withDeletedParticipation) queryBuilder.whereNull('deletedAt');

  const campaignParticipations = await queryBuilder;

  return campaignParticipations.map((campaignParticipation) => new CampaignParticipation(campaignParticipation));
};

const updateInBatchByIds = async function (campaignParticipations) {
  return await batchUpdate({
    tableName: 'campaign-participations',
    primaryKeyName: 'id',
    rows: campaignParticipations,
  });
};

const findInfoByCampaignId = async function ({
  campaignId,
  page,
  since,
  sort = [
    { value: 'lastName', type: 'ASC' },
    { value: 'firstName', type: 'ASC' },
    { value: 'createdAt', type: 'DESC' },
  ],
}) {
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn('campaign-participations')
    .select([
      'campaign-participations.*',
      'view-active-organization-learners.studentNumber',
      'view-active-organization-learners.division',
      'view-active-organization-learners.group',
      'view-active-organization-learners.firstName',
      'view-active-organization-learners.lastName',
      'view-active-organization-learners.attributes',
    ])
    .join(
      'view-active-organization-learners',
      'view-active-organization-learners.id',
      'campaign-participations.organizationLearnerId',
    )
    .where({ campaignId, 'campaign-participations.deletedAt': null });

  sort.forEach((order) => query.orderBy(order.value, order.type));

  if (since !== undefined) {
    const sinceDate = new Date(since);
    query.where(function () {
      this.where('campaign-participations.sharedAt', '>', sinceDate).orWhere(
        'campaign-participations.createdAt',
        '>',
        sinceDate,
      );
    });
  }

  const { results, pagination } = await fetchPage({
    queryBuilder: query,
    paginationParams: page,
  });

  return { models: results.map(_rowToResult), meta: pagination };
};

const findOneByCampaignIdAndUserId = async function ({ campaignId, userId }) {
  const knexConn = DomainTransaction.getConnection();
  const campaignParticipation = await knexConn('campaign-participations')
    .where({ userId, isImproved: false, campaignId })
    .first();
  if (!campaignParticipation) return null;
  const assessments = await knexConn('assessments').where({ campaignParticipationId: campaignParticipation.id });
  const campaign = await campaignRepository.get(campaignId);
  return new CampaignParticipation({
    ...campaignParticipation,
    assessments: assessments.map(
      (assessment) =>
        new Assessment({
          ...assessment,
          campaign,
        }),
    ),
  });
};

const findByOrganizationLearnerIds = async function ({ organizationLearnerIds }) {
  const knexConn = DomainTransaction.getConnection();
  const rows = await knexConn('campaign-participations')
    .select({
      id: 'campaign-participations.id',
      campaignId: 'campaigns.id',
      targetProfileId: 'campaigns.targetProfileId',
      organizationLearnerId: 'campaign-participations.organizationLearnerId',
      status: 'campaign-participations.status',
      masteryRate: 'campaign-participations.masteryRate',
      validatedSkillsCount: 'campaign-participations.validatedSkillsCount',
    })
    .select(
      knexConn.raw('NULLIF(COUNT(DISTINCT stages.id), 0) as "totalStagesCount"'),
      knexConn.raw(
        'CASE WHEN COUNT(DISTINCT stages.id) = 0 THEN NULL ELSE COUNT(DISTINCT "stage-acquisitions".id) END as "validatedStagesCount"',
      ),
    )
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .leftJoin('stages', 'stages.targetProfileId', 'campaigns.targetProfileId')
    .leftJoin('stage-acquisitions', function () {
      this.on('stage-acquisitions.stageId', '=', 'stages.id').andOn(
        'stage-acquisitions.campaignParticipationId',
        '=',
        'campaign-participations.id',
      );
    })
    .whereIn('campaign-participations.organizationLearnerId', organizationLearnerIds)
    .whereNull('campaign-participations.deletedAt')
    .groupBy(
      'campaign-participations.id',
      'campaigns.id',
      'campaigns.targetProfileId',
      'campaign-participations.organizationLearnerId',
      'campaign-participations.status',
      'campaign-participations.masteryRate',
      'campaign-participations.validatedSkillsCount',
    );
  return rows.map(
    (row) =>
      new OrganizationLearnerCampaignParticipation({
        id: row.id,
        campaignId: row.campaignId,
        targetProfileId: row.targetProfileId,
        organizationLearnerId: row.organizationLearnerId,
        status: row.status,
        masteryRate: row.masteryRate != null ? Number(row.masteryRate) : null,
        validatedSkillsCount: row.validatedSkillsCount ?? null,
        totalStagesCount: row.totalStagesCount != null ? Number(row.totalStagesCount) : null,
        validatedStagesCount: row.validatedStagesCount != null ? Number(row.validatedStagesCount) : null,
      }),
  );
};

const getCampaignParticipationsCountByUserId = async function ({ userId }) {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn('campaign-participations')
    .count('campaign-participations.id as count')
    .where({ userId })
    .first();
  return result.count;
};

const hasAssessmentParticipations = async function (userId) {
  const knexConn = DomainTransaction.getConnection();
  const { count: assessmentCount } = await knexConn('assessments')
    .count('assessments.id')
    .leftJoin('campaign-participations', 'campaignParticipationId', 'campaign-participations.id')
    .leftJoin('campaigns', 'campaigns.id', 'campaignId')
    .where('assessments.type', '=', Assessment.types.CAMPAIGN)
    .where({ 'assessments.userId': userId })
    .where(function () {
      this.whereNot('campaigns.organizationId', config.autonomousCourse.autonomousCoursesOrganizationId).orWhereNull(
        'campaigns.organizationId',
      );
    })
    .where(function () {
      this.where('campaigns.isForAbsoluteNovice', false).orWhereNull('campaigns.organizationId');
    })
    .where(function () {
      this.whereIn('campaigns.type', [CampaignTypes.ASSESSMENT, CampaignTypes.EXAM]).orWhereNull(
        'campaigns.organizationId',
      );
    })
    .first();

  const { count: combinedCourseCount } = await knexConn('view-active-organization-learners')
    .count('organization_learner_participations.id')
    .join(
      'organization_learner_participations',
      'organization_learner_participations.organizationLearnerId',
      'view-active-organization-learners.id',
    )
    .where({ userId, type: OrganizationLearnerParticipationTypes.COMBINED_COURSE })
    .first();

  return assessmentCount > 0 || combinedCourseCount > 0;
};

const getCodeOfLastParticipationToProfilesCollectionCampaignForUser = async function (userId) {
  const knexConn = DomainTransaction.getConnection();

  const result = await knexConn('campaign-participations')
    .select('campaigns.code')
    .join('campaigns', 'campaigns.id', 'campaignId')
    .where({ userId })
    .whereNull('campaign-participations.deletedAt')
    .whereNull('archivedAt')
    .where('status', STARTED)
    .andWhere({ 'campaigns.type': CampaignTypes.PROFILES_COLLECTION })
    .orderBy('campaign-participations.createdAt', 'desc')
    .first();
  return result?.code || null;
};

const isRetrying = async function ({ campaignParticipationId }) {
  const knexConn = DomainTransaction.getConnection();
  const { id: campaignId, organizationLearnerId } = await knexConn('campaigns')
    .select('campaigns.id', 'organizationLearnerId')
    .join('campaign-participations', 'campaigns.id', 'campaignId')
    .where({ 'campaign-participations.id': campaignParticipationId })
    .first();

  const campaignParticipations = await knexConn('campaign-participations')
    .select('sharedAt', 'isImproved')
    .where({ campaignId, organizationLearnerId });

  return (
    campaignParticipations.length > 1 &&
    campaignParticipations.some((participation) => !participation.isImproved && !participation.sharedAt)
  );
};

function _rowToResult(row) {
  return new CampaignParticipationInfo({
    campaignParticipationId: row.id,
    createdAt: new Date(row.createdAt),
    sharedAt: row.sharedAt ? new Date(row.sharedAt) : null,
    participantExternalId: row.participantExternalId,
    userId: row.userId,
    isCompleted: row.state === 'completed',
    studentNumber: row.studentNumber,
    participantFirstName: row.firstName,
    participantLastName: row.lastName,
    division: row.division,
    additionalInfos: row.attributes,
    pixScore: row.pixScore,
    group: row.group,
    status: row.status,
    masteryRate: row.masteryRate,
    validatedSkillsCount: row.validatedSkillsCount,
  });
}

async function getSharedParticipationIds(campaignId) {
  const knexConn = DomainTransaction.getConnection();
  const results = await knexConn('campaign-participations')
    .pluck('id')
    .where({ campaignId, status: SHARED, isImproved: false, deletedAt: null });

  return results;
}

export {
  findByOrganizationLearnerIds,
  findInfoByCampaignId,
  findOneByCampaignIdAndUserId,
  get,
  getAllCampaignParticipationsForOrganizationLearnerIds,
  getAllCampaignParticipationsInCampaignForASameLearner,
  getByCampaignIds,
  getCampaignParticipationsCountByUserId,
  getCampaignParticipationsForOrganizationLearner,
  getCodeOfLastParticipationToProfilesCollectionCampaignForUser,
  getLocked,
  getSharedParticipationIds,
  hasAssessmentParticipations,
  isRetrying,
  updateInBatchByIds,
  updateWithSnapshot,
};
