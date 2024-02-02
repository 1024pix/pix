import * as knowledgeElementRepository from '../../../../../lib/infrastructure/repositories/knowledge-element-repository.js';
import * as knowledgeElementSnapshotRepository from '../../../../../lib/infrastructure/repositories/knowledge-element-snapshot-repository.js';
import { Campaign } from '../../../../../lib/domain/models/Campaign.js';

import { CampaignParticipation } from '../../domain/models/CampaignParticipation.js';
import { Assessment } from '../../../../shared/domain/models/Assessment.js';

const updateWithSnapshot = async function (campaignParticipation, domainTransaction) {
  await this.update(campaignParticipation, domainTransaction);

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
  const knexConn = domainTransaction.knexTransaction;

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
  const knexConn = domainTransaction.knexTransaction;

  const campaignParticipation = await knexConn.from('campaign-participations').where({ id }).first();
  const campaign = await knexConn.from('campaigns').where({ id: campaignParticipation.campaignId }).first();
  const assessments = await knexConn.from('assessments').where({ campaignParticipationId: id });

  return new CampaignParticipation({
    ...campaignParticipation,
    campaign: new Campaign(campaign),
    assessments: assessments.map((assessment) => new Assessment(assessment)),
  });
};

export { get, updateWithSnapshot, update };
