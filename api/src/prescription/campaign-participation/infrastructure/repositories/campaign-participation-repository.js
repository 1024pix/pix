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

  const participationData = await baseQuery(knexConn)
    .where('campaign-participations.id', id)
    .forUpdate('campaign-participations');

  return toDomainCampaignParticipation(participationData);
};

const get = async function (id) {
  const knexConn = DomainTransaction.getConnection();

  const participationData = await baseQuery(knexConn).where('campaign-participations.id', id);

  return toDomainCampaignParticipation(participationData);
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

  const participationData = await baseQuery(knexConn)
    .where('campaign-participations.userId', userId)
    .where('campaign-participations.isImproved', false)
    .where('campaign-participations.campaignId', campaignId);

  if (participationData.length === 0) {
    return null;
  }

  return toDomainCampaignParticipation(participationData);
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
  const { participationCountToCampaign, hasUnsharedRetry } = await knexConn('campaign-participations')
    .whereIn(
      ['campaignId', 'organizationLearnerId'],
      knexConn('campaign-participations')
        .select('campaignId', 'organizationLearnerId')
        .where({ id: campaignParticipationId }),
    )
    .select(
      knexConn.raw('COUNT(*) AS "participationCountToCampaign"'),
      knexConn.raw('BOOL_OR(NOT "isImproved" AND "sharedAt" IS NULL) AS "hasUnsharedRetry"'),
    )
    .first();

  return participationCountToCampaign > 1 && hasUnsharedRetry;
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
  return knexConn('campaign-participations')
    .pluck('id')
    .where({ campaignId, status: SHARED, isImproved: false, deletedAt: null });
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

function baseQuery(knexConn) {
  return knexConn
    .select({
      campaignId: 'campaigns.id',
      campaignName: 'campaigns.name',
      campaignCode: 'campaigns.code',
      campaignOrganizationId: 'campaigns.organizationId',
      campaignCreatorId: 'campaigns.creatorId',
      campaignCreatedAt: 'campaigns.createdAt',
      campaignTargetProfileId: 'campaigns.targetProfileId',
      campaignIdPixLabel: 'campaigns.idPixLabel',
      campaignTitle: 'campaigns.title',
      campaignCustomLandingPageText: 'campaigns.customLandingPageText',
      campaignArchivedAt: 'campaigns.archivedAt',
      campaignType: 'campaigns.type',
      campaignExternalIdHelpImageUrl: 'campaigns.externalIdHelpImageUrl',
      campaignAlternativeTextToExternalIdHelpImage: 'campaigns.alternativeTextToExternalIdHelpImage',
      campaignIsForAbsoluteNovice: 'campaigns.isForAbsoluteNovice',
      campaignCustomResultPageText: 'campaigns.customResultPageText',
      campaignCustomResultPageButtonText: 'campaigns.customResultPageButtonText',
      campaignCustomResultPageButtonUrl: 'campaigns.customResultPageButtonUrl',
      campaignMultipleSendings: 'campaigns.multipleSendings',
      campaignAssessmentMethod: 'campaigns.assessmentMethod',
      campaignOwnerId: 'campaigns.ownerId',
      campaignArchivedBy: 'campaigns.archivedBy',
      campaignDeletedAt: 'campaigns.deletedAt',
      campaignDeletedBy: 'campaigns.deletedBy',
      participationId: 'campaign-participations.id',
      participationCreatedAt: 'campaign-participations.createdAt',
      participationParticipantExternalId: 'campaign-participations.participantExternalId',
      participationStatus: 'campaign-participations.status',
      participationSharedAt: 'campaign-participations.sharedAt',
      participationDeletedAt: 'campaign-participations.deletedAt',
      participationDeletedBy: 'campaign-participations.deletedBy',
      participationUserId: 'campaign-participations.userId',
      participationValidatedSkillsCount: 'campaign-participations.validatedSkillsCount',
      participationPixScore: 'campaign-participations.pixScore',
      participationOrganizationLearnerId: 'campaign-participations.organizationLearnerId',
      assessmentId: 'assessments.id',
      assessmentCreatedAt: 'assessments.createdAt',
      assessmentUpdatedAt: 'assessments.updatedAt',
      assessmentState: 'assessments.state',
      assessmentType: 'assessments.type',
      assessmentIsImproving: 'assessments.isImproving',
      assessmentLastChallengeId: 'assessments.lastChallengeId',
      assessmentLastQuestionState: 'assessments.lastQuestionState',
      assessmentLastQuestionDate: 'assessments.lastQuestionDate',
      assessmentCourseId: 'assessments.courseId',
      assessmentCertificationCourseId: 'assessments.certificationCourseId',
      assessmentUserId: 'assessments.userId',
      assessmentCompetenceId: 'assessments.competenceId',
      assessmentCampaignParticipationId: 'assessments.campaignParticipationId',
      assessmentMethod: 'assessments.method',
    })
    .from('campaign-participations')
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .leftJoin('assessments', 'assessments.campaignParticipationId', 'campaign-participations.id');
}

function toDomainCampaignParticipation(participationData) {
  const commonData = participationData[0];
  const campaign = new Campaign({
    id: commonData.campaignId,
    name: commonData.campaignName,
    code: commonData.campaignCode,
    organizationId: commonData.campaignOrganizationId,
    creatorId: commonData.campaignCreatorId,
    createdAt: commonData.campaignCreatedAt,
    targetProfileId: commonData.campaignTargetProfileId,
    idPixLabel: commonData.campaignIdPixLabel,
    title: commonData.campaignTitle,
    customLandingPageText: commonData.campaignCustomLandingPageText,
    archivedAt: commonData.campaignArchivedAt,
    type: commonData.campaignType,
    externalIdHelpImageUrl: commonData.campaignExternalIdHelpImageUrl,
    alternativeTextToExternalIdHelpImage: commonData.campaignAlternativeTextToExternalIdHelpImage,
    isForAbsoluteNovice: commonData.campaignIsForAbsoluteNovice,
    customResultPageText: commonData.campaignCustomResultPageText,
    customResultPageButtonText: commonData.campaignCustomResultPageButtonText,
    customResultPageButtonUrl: commonData.campaignCustomResultPageButtonUrl,
    multipleSendings: commonData.campaignMultipleSendings,
    assessmentMethod: commonData.campaignAssessmentMethod,
  });
  let assessments = [];
  if (commonData.assessmentId) {
    assessments = participationData.map(
      (assessmentData) =>
        new Assessment({
          id: assessmentData.assessmentId,
          createdAt: assessmentData.assessmentCreatedAt,
          updatedAt: assessmentData.assessmentUpdatedAt,
          state: assessmentData.assessmentState,
          type: assessmentData.assessmentType,
          isImproving: assessmentData.assessmentIsImproving,
          lastChallengeId: assessmentData.assessmentLastChallengeId,
          lastQuestionState: assessmentData.assessmentLastQuestionState,
          lastQuestionDate: assessmentData.assessmentLastQuestionDate,
          courseId: assessmentData.assessmentCourseId,
          certificationCourseId: assessmentData.assessmentCertificationCourseId,
          userId: assessmentData.assessmentUserId,
          competenceId: assessmentData.assessmentCompetenceId,
          campaignParticipationId: assessmentData.assessmentCampaignParticipationId,
          method: assessmentData.assessmentMethod,
          campaign,
        }),
    );
  }

  return new CampaignParticipation({
    id: commonData.participationId,
    createdAt: commonData.participationCreatedAt,
    participantExternalId: commonData.participationParticipantExternalId,
    status: commonData.participationStatus,
    sharedAt: commonData.participationSharedAt,
    deletedAt: commonData.participationDeletedAt,
    deletedBy: commonData.participationDeletedBy,
    userId: commonData.participationUserId,
    validatedSkillsCount: commonData.participationValidatedSkillsCount,
    pixScore: commonData.participationPixScore,
    organizationLearnerId: commonData.participationOrganizationLearnerId,
    campaign,
    assessments,
  });
}
