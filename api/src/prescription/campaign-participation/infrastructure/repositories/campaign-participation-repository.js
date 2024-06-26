import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { Campaign } from '../../../../../lib/domain/models/Campaign.js';
import * as knowledgeElementRepository from '../../../../../lib/infrastructure/repositories/knowledge-element-repository.js';
import * as knowledgeElementSnapshotRepository from '../../../../../lib/infrastructure/repositories/knowledge-element-snapshot-repository.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { Assessment } from '../../../../shared/domain/models/Assessment.js';
import { ApplicationTransaction } from '../../../shared/infrastructure/ApplicationTransaction.js';
import { CampaignParticipation } from '../../domain/models/CampaignParticipation.js';
import { AvailableCampaignParticipation } from '../../domain/read-models/AvailableCampaignParticipation.js';

const updateWithSnapshot = async function (campaignParticipation) {
  const domainTransaction = ApplicationTransaction.getTransactionAsDomainTransaction();
  await this.update(campaignParticipation);

  const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({
    userId: campaignParticipation.userId,
    limitDate: campaignParticipation.sharedAt,
    domainTransaction,
  });
  await knowledgeElementSnapshotRepository.save({
    userId: campaignParticipation.userId,
    snappedAt: campaignParticipation.sharedAt,
    knowledgeElements,
    domainTransaction,
  });
};

const update = async function (campaignParticipation, domainTransaction) {
  const knexConn = ApplicationTransaction.getConnection(domainTransaction);

  const attributes = {
    participantExternalId: campaignParticipation.participantExternalId,
    sharedAt: campaignParticipation.sharedAt,
    status: campaignParticipation.status,
    campaignId: campaignParticipation.campaignId,
    userId: campaignParticipation.userId,
    organizationLearnerId: campaignParticipation.organizationLearnerId,
  };

  await knexConn('campaign-participations').where({ id: campaignParticipation.id }).update(attributes);
};

const get = async function (id, domainTransaction) {
  const knexConn = ApplicationTransaction.getConnection(domainTransaction);

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
  const knexConn = ApplicationTransaction.getConnection();
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

export {
  get,
  getAllCampaignParticipationsInCampaignForASameLearner,
  getByCampaignIds,
  getCampaignParticipationsForOrganizationLearner,
  remove,
  update,
  updateWithSnapshot,
};
