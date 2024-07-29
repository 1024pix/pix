import lodash from 'lodash';

import { knex } from '../../../../../db/knex-database-connection.js';
import * as knowledgeElementRepository from '../../../../../lib/infrastructure/repositories/knowledge-element-repository.js';
import * as knowledgeElementSnapshotRepository from '../../../../../lib/infrastructure/repositories/knowledge-element-snapshot-repository.js';
import { Campaign } from '../../../../../src/shared/domain/models/Campaign.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { Assessment } from '../../../../shared/domain/models/Assessment.js';
import { CampaignParticipation } from '../../domain/models/CampaignParticipation.js';
import { AvailableCampaignParticipation } from '../../domain/read-models/AvailableCampaignParticipation.js';

const { pick } = lodash;

import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';

const CAMPAIGN_PARTICIPATION_ATTRIBUTES = [
  'participantExternalId',
  'sharedAt',
  'status',
  'campaignId',
  'userId',
  'organizationLearnerId',
  'deletedAt',
  'deletedBy',
];

const updateWithSnapshot = async function (campaignParticipation) {
  await this.update(campaignParticipation);

  const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({
    userId: campaignParticipation.userId,
    limitDate: campaignParticipation.sharedAt,
  });
  await knowledgeElementSnapshotRepository.save({
    userId: campaignParticipation.userId,
    snappedAt: campaignParticipation.sharedAt,
    knowledgeElements,
  });
};

const update = async function (campaignParticipation) {
  const knexConn = DomainTransaction.getConnection();

  await knexConn('campaign-participations')
    .where({ id: campaignParticipation.id })
    .update(pick(campaignParticipation, CAMPAIGN_PARTICIPATION_ATTRIBUTES));
};

const batchUpdate = async function (campaignParticipations) {
  return Promise.all(campaignParticipations.map((campaignParticipation) => update(campaignParticipation)));
};

const get = async function (id) {
  const knexConn = DomainTransaction.getConnection();

  const campaignParticipation = await knexConn.from('campaign-participations').where({ id }).first();
  const campaign = await knexConn.from('campaigns').where({ id: campaignParticipation.campaignId }).first();
  const assessments = await knexConn.from('assessments').where({ campaignParticipationId: id });

  return new CampaignParticipation({
    ...campaignParticipation,
    campaign: new Campaign(campaign),
    assessments: assessments.map((assessment) => new Assessment(assessment)),
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
  const campaignParticipations = await knex('campaign-participations')
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

const remove = async function ({ id, deletedAt, deletedBy }) {
  const knexConn = DomainTransaction.getConnection();
  return await knexConn('campaign-participations').where({ id }).update({ deletedAt, deletedBy });
};

const findProfilesCollectionResultDataByCampaignId = async function (campaignId) {
  const results = await knex('campaign-participations')
    .select([
      'campaign-participations.*',
      'view-active-organization-learners.studentNumber',
      'view-active-organization-learners.division',
      'view-active-organization-learners.group',
      'view-active-organization-learners.firstName',
      'view-active-organization-learners.lastName',
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

  return results.map(_rowToResult);
};

function _rowToResult(row) {
  return {
    id: row.id,
    createdAt: new Date(row.createdAt),
    isShared: row.status === CampaignParticipationStatuses.SHARED,
    sharedAt: row.sharedAt ? new Date(row.sharedAt) : null,
    participantExternalId: row.participantExternalId,
    userId: row.userId,
    isCompleted: row.state === 'completed',
    studentNumber: row.studentNumber,
    participantFirstName: row.firstName,
    participantLastName: row.lastName,
    division: row.division,
    pixScore: row.pixScore,
    group: row.group,
  };
}

export {
  batchUpdate,
  findProfilesCollectionResultDataByCampaignId,
  get,
  getAllCampaignParticipationsInCampaignForASameLearner,
  getByCampaignIds,
  getCampaignParticipationsForOrganizationLearner,
  remove,
  update,
  updateWithSnapshot,
};
