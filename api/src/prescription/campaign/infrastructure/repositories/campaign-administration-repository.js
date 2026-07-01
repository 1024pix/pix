import _ from 'lodash';

import { CAMPAIGN_FEATURES } from '../../../../shared/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { cryptoService } from '../../../../shared/domain/services/crypto-service.js';
import * as skillRepository from '../../../../shared/infrastructure/repositories/skill-repository.js';
import { batchUpdate } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { UnknownCampaignId } from '../../domain/errors.js';
import { Campaign } from '../../domain/models/Campaign.js';

const CAMPAIGN_ATTRIBUTES = [
  'deletedAt',
  'deletedBy',
  'archivedAt',
  'archivedBy',
  'name',
  'code',
  'title',
  'type',
  'isForAbsoluteNovice',
  'customLandingPageText',
  'creatorId',
  'ownerId',
  'organizationId',
  'targetProfileId',
  'multipleSendings',
  'createdAt',
  'customResultPageText',
  'customResultPageButtonText',
  'customResultPageButtonUrl',
];

const findByIds = async (ids) => {
  const knexConn = DomainTransaction.getConnection();
  const campaigns = await knexConn('campaigns').whereIn('id', ids);

  return campaigns.map((campaign) => new Campaign(campaign));
};

const getByCode = async function (code) {
  const knexConn = DomainTransaction.getConnection();
  const campaign = await knexConn.select('id').from('campaigns').where({ code }).first();

  if (!campaign) return null;

  return get(campaign.id);
};

const get = async function (id) {
  const knexConn = DomainTransaction.getConnection();
  const campaign = await knexConn('campaigns').where({ id }).first();

  if (!campaign) return null;

  const { count: participationCount } = await knexConn('campaign-participations')
    .count('id')
    .where({ campaignId: id })
    .first();

  return new Campaign({
    ...campaign,
    participationCount,
  });
};

const update = async function (campaign) {
  return _update(campaign, CAMPAIGN_ATTRIBUTES);
};

const CAMPAIGN_DELETION_ATTRIBUTES = [
  'name',
  'title',
  'customLandingPageText',
  'externalIdHelpImageUrl',
  'alternativeTextToExternalIdHelpImage',
  'customResultPageText',
  'customResultPageButtonText',
  'customResultPageButtonUrl',
  'deletedAt',
  'deletedBy',
];

const removeInBatch = async function (campaigns) {
  await batchUpdate({
    tableName: 'campaigns',
    primaryKeyName: 'id',
    rows: campaigns.map((campaign) => ({ id: campaign.id, ..._.pick(campaign, CAMPAIGN_DELETION_ATTRIBUTES) })),
  });
};

const _update = async function (campaign, attributes) {
  const knexConn = DomainTransaction.getConnection();
  const [editedCampaign] = await knexConn('campaigns')
    .where({ id: campaign.id })
    .update(_.pick(campaign, attributes))
    .returning('*');

  return new Campaign(editedCampaign);
};

const save = async function (campaigns, dependencies = { skillRepository }) {
  const knexConn = DomainTransaction.getConnection();
  const campaignsToCreate = _.isArray(campaigns) ? campaigns : [campaigns];
  const createdCampaigns = [];
  let latestCreatedCampaign;
  for (const campaign of campaignsToCreate) {
    const campaignAttributes = _.pick(campaign, CAMPAIGN_ATTRIBUTES);
    const [createdCampaignDTO] = await knexConn('campaigns').insert(campaignAttributes).returning('*');
    latestCreatedCampaign = new Campaign(createdCampaignDTO);

    if (campaign.externalIdLabel) {
      const feature = await knexConn('features').where({ key: CAMPAIGN_FEATURES.EXTERNAL_ID.key }).first();
      const [{ params }] = await knexConn('campaign-features')
        .insert({
          campaignId: latestCreatedCampaign.id,
          featureId: feature.id,
          params: { label: campaign.externalIdLabel, type: campaign.externalIdType },
        })
        .returning('*');
      latestCreatedCampaign.externalIdLabel = params.label;
      latestCreatedCampaign.externalIdType = params.type;
    }

    if (latestCreatedCampaign.isAssessment || latestCreatedCampaign.isExam) {
      const cappedTubes = await knexConn('target-profile_tubes')
        .select('tubeId', 'level')
        .where('targetProfileId', campaignAttributes.targetProfileId);
      const skillData = [];
      for (const cappedTube of cappedTubes) {
        const allLevelSkills = await dependencies.skillRepository.findActiveByTubeId(cappedTube.tubeId);
        const rightLevelSkills = allLevelSkills.filter((skill) => skill.difficulty <= cappedTube.level);
        skillData.push(
          ...rightLevelSkills.map((skill) => ({ skillId: skill.id, campaignId: latestCreatedCampaign.id })),
        );
      }
      await knexConn.batchInsert('campaign_skills', skillData).transacting(knexConn);
    }

    createdCampaigns.push(latestCreatedCampaign);
  }
  return Array.isArray(campaigns) ? createdCampaigns : createdCampaigns[0];
};

const swapCampaignCodes = async function ({ firstCampaignId, secondCampaignId }) {
  const knexConn = DomainTransaction.getConnection();

  const randomBytesBuffer = await cryptoService.randomBytes(16);
  const temporaryCode = randomBytesBuffer.toString('base64');

  const { code: firstCode } = await knexConn('campaigns').select('code').where({ id: firstCampaignId }).first();
  const { code: secondCode } = await knexConn('campaigns').select('code').where({ id: secondCampaignId }).first();

  await knexConn('campaigns').where({ id: secondCampaignId }).update({ code: temporaryCode });

  await knexConn('campaigns').where({ id: firstCampaignId }).update({ code: secondCode });
  await knexConn('campaigns').where({ id: secondCampaignId }).update({ code: firstCode });
};

const isFromSameOrganization = async function ({ firstCampaignId, secondCampaignId }) {
  const knexConn = DomainTransaction.getConnection();

  const firstCampaign = await knexConn('campaigns').select('organizationId').where({ id: firstCampaignId }).first();
  const secondCampaign = await knexConn('campaigns').select('organizationId').where({ id: secondCampaignId }).first();

  if (!firstCampaign || !secondCampaign) {
    throw new UnknownCampaignId();
  }

  return firstCampaign.organizationId === secondCampaign.organizationId;
};

const archiveCampaigns = function (campaignIds, userId) {
  const knexConn = DomainTransaction.getConnection();

  return knexConn('campaigns').whereNull('archivedAt').whereInArray('id', campaignIds).update({
    archivedBy: userId,
    archivedAt: new Date(),
  });
};

/**
 * Deletes the external ID label from campaigns features.
 *
 * @param {number[]} campaignIds - The IDs of the campaigns to update.
 * @returns {Promise<void>}
 */
export const deleteExternalIdLabelFromCampaigns = (campaignIds) => {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('campaign-features')
    .update('params', knexConn.raw("params - 'label'"))
    .updateFrom('features')
    .where('features.id', '=', knexConn.raw('??', ['campaign-features.featureId']))
    .where('features.key', '=', CAMPAIGN_FEATURES.EXTERNAL_ID.key)
    .whereIn('campaign-features.campaignId', campaignIds);
};

export {
  archiveCampaigns,
  findByIds,
  get,
  getByCode,
  isFromSameOrganization,
  removeInBatch,
  save,
  swapCampaignCodes,
  update,
};
