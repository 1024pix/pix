import lodash from 'lodash';

import { constants } from '../../../../shared/domain/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { Assessment } from '../../../../shared/domain/models/Assessment.js';
import * as knowledgeElementRepository from '../../../../shared/infrastructure/repositories/knowledge-element-repository.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { Campaign } from '../../../campaign/domain/models/Campaign.js';
import { CampaignParticipationInfo } from '../../../campaign/domain/read-models/CampaignParticipationInfo.js';
import * as campaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
import * as knowledgeElementSnapshotRepository from '../../../campaign/infrastructure/repositories/knowledge-element-snapshot-repository.js';
import { CampaignParticipationStatuses, CampaignTypes } from '../../../shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../shared/domain/models/KnowledgeElementCollection.js';
import { CampaignParticipation } from '../../domain/models/CampaignParticipation.js';
import { AvailableCampaignParticipation } from '../../domain/read-models/AvailableCampaignParticipation.js';

const { TO_SHARE, SHARED } = CampaignParticipationStatuses;

const { pick } = lodash;

const CAMPAIGN_PARTICIPATION_ATTRIBUTES = [
  'participantExternalId',
  'sharedAt',
  'status',
  'userId',
  'organizationLearnerId',
  'deletedAt',
  'deletedBy',
];

const updateWithSnapshot = async function (campaignParticipation) {
  await update(campaignParticipation);
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

const update = async function (campaignParticipation) {
  const knexConn = DomainTransaction.getConnection();

  await knexConn('campaign-participations')
    .where({ id: campaignParticipation.id })
    .update(pick(campaignParticipation, CAMPAIGN_PARTICIPATION_ATTRIBUTES));
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

const getByCampaignIds = async function (campaignIds) {
  const knexConn = DomainTransaction.getConnection();
  const campaignParticipations = await knexConn('campaign-participations')
    .whereNull('deletedAt')
    .whereIn('campaignId', campaignIds);
  return campaignParticipations.map((campaignParticipation) => new CampaignParticipation(campaignParticipation));
};

const getAllCampaignParticipationsInCampaignForASameLearner = async function ({ campaignId, campaignParticipationId }) {
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

  const campaignParticipations = await knexConn('campaign-participations')
    .where({
      campaignId,
      organizationLearnerId: result.organizationLearnerId,
    })
    .whereNull('deletedAt')
    .whereNull('deletedBy');

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

const getAllCampaignParticipationsForOrganizationLearner = async function ({ organizationLearnerId }) {
  const knexConn = DomainTransaction.getConnection();
  const campaignParticipations = await knexConn('campaign-participations')
    .where({
      organizationLearnerId,
    })
    .whereNull('deletedAt')
    .whereNull('deletedBy')
    .orderBy('createdAt', 'desc');

  return campaignParticipations.map((campaignParticipation) => new CampaignParticipation(campaignParticipation));
};

const remove = async function ({ id, attributes }) {
  const knexConn = DomainTransaction.getConnection();
  return await knexConn('campaign-participations').where({ id }).update(attributes);
};

const findInfoByCampaignId = async function (campaignId, page) {
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
    .where({ campaignId, 'campaign-participations.deletedAt': null })
    .orderBy('lastName', 'ASC')
    .orderBy('firstName', 'ASC')
    .orderBy('createdAt', 'DESC');

  const { results, pagination } = await fetchPage(query, page);

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
  const { count } = await knexConn('assessments')
    .count('assessments.id')
    .leftJoin('campaign-participations', 'campaignParticipationId', 'campaign-participations.id')
    .leftJoin('campaigns', 'campaigns.id', 'campaignId')
    .where('assessments.type', '=', Assessment.types.CAMPAIGN)
    .where({ 'assessments.userId': userId })
    .where(function () {
      this.whereNot('campaigns.organizationId', constants.AUTONOMOUS_COURSES_ORGANIZATION_ID).orWhereNull(
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

  return count > 0;
};

const getCodeOfLastParticipationToProfilesCollectionCampaignForUser = async function (userId) {
  const knexConn = DomainTransaction.getConnection();

  const result = await knexConn('campaign-participations')
    .select('campaigns.code')
    .join('campaigns', 'campaigns.id', 'campaignId')
    .where({ userId })
    .whereNull('campaign-participations.deletedAt')
    .whereNull('archivedAt')
    .andWhere({ status: TO_SHARE })
    .andWhere({ 'campaigns.type': CampaignTypes.PROFILES_COLLECTION })
    .orderBy('campaign-participations.createdAt', 'desc')
    .first();
  return result?.code || null;
};

const isRetrying = async function ({ campaignParticipationId }) {
  const knexConn = DomainTransaction.getConnection();
  const { id: campaignId, userId } = await knexConn('campaigns')
    .select('campaigns.id', 'userId')
    .join('campaign-participations', 'campaigns.id', 'campaignId')
    .where({ 'campaign-participations.id': campaignParticipationId })
    .first();

  const campaignParticipations = await knexConn('campaign-participations')
    .select('sharedAt', 'isImproved')
    .where({ campaignId, userId });

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
  findInfoByCampaignId,
  findOneByCampaignIdAndUserId,
  get,
  getAllCampaignParticipationsForOrganizationLearner,
  getAllCampaignParticipationsInCampaignForASameLearner,
  getByCampaignIds,
  getCampaignParticipationsCountByUserId,
  getCampaignParticipationsForOrganizationLearner,
  getCodeOfLastParticipationToProfilesCollectionCampaignForUser,
  getLocked,
  getSharedParticipationIds,
  hasAssessmentParticipations,
  isRetrying,
  remove,
  update,
  updateWithSnapshot,
};
