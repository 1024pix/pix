import _ from 'lodash';

import { knex } from '../../../../../db/knex-database-connection.js';
import { cryptoService } from '../../../../shared/domain/services/crypto-service.js';
import * as skillRepository from '../../../../shared/infrastructure/repositories/skill-repository.js';
import { ApplicationTransaction } from '../../../shared/infrastructure/ApplicationTransaction.js';
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
  'idPixLabel',
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

const getByIds = async (ids) => {
  const knexConn = ApplicationTransaction.getConnection();
  const campaigns = await knexConn('campaigns').whereIn('id', ids);

  if (campaigns.length === 0) return null;

  return campaigns.map((campaign) => new Campaign(campaign));
};

const getByCode = async function (code) {
  const campaign = await knex.select('id').from('campaigns').where({ code }).first();

  if (!campaign) return null;

  return get(campaign.id);
};

const get = async function (id) {
  const campaign = await knex('campaigns').where({ id }).first();

  if (!campaign) return null;

  const { count: participationCount } = await knex('campaign-participations')
    .count('id')
    .where({ campaignId: id })
    .first();

  return new Campaign({
    ...campaign,
    participationCount,
  });
};

const update = async function (campaign) {
  const knexConn = ApplicationTransaction.getConnection();
  const [editedCampaign] = await knexConn('campaigns')
    .where({ id: campaign.id })
    .update(_.pick(campaign, CAMPAIGN_ATTRIBUTES))
    .returning('*');

  return new Campaign(editedCampaign);
};

const batchUpdate = async function (campaigns) {
  return Promise.all(campaigns.map((campaign) => update(campaign)));
};

const save = async function (campaigns, dependencies = { skillRepository }) {
  const trx = await knex.transaction();
  const campaignsToCreate = _.isArray(campaigns) ? campaigns : [campaigns];

  try {
    let latestCreatedCampaign;
    for (const campaign of campaignsToCreate) {
      const campaignAttributes = _.pick(campaign, CAMPAIGN_ATTRIBUTES);
      const [createdCampaignDTO] = await trx('campaigns').insert(campaignAttributes).returning('*');
      latestCreatedCampaign = new Campaign(createdCampaignDTO);
      if (latestCreatedCampaign.isAssessment()) {
        const cappedTubes = await trx('target-profile_tubes')
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
        await trx.batchInsert('campaign_skills', skillData);
      }
    }
    await trx.commit();
    return latestCreatedCampaign;
  } catch (err) {
    await trx.rollback();
    throw err;
  }
};

const isCodeAvailable = async function ({ code }) {
  return !(await knex('campaigns').first('id').where({ code }));
};

const swapCampaignCodes = async function ({ firstCampaignId, secondCampaignId }) {
  const trx = await knex.transaction();
  const randomBytesBuffer = await cryptoService.randomBytes(16);
  const temporaryCode = randomBytesBuffer.toString('base64');

  try {
    const [{ code: firstCode }, { code: secondCode }] = await Promise.all([
      trx('campaigns').select('code').where({ id: firstCampaignId }).first(),
      trx('campaigns').select('code').where({ id: secondCampaignId }).first(),
    ]);

    await trx('campaigns').where({ id: secondCampaignId }).update({ code: temporaryCode });

    await trx('campaigns').where({ id: firstCampaignId }).update({ code: secondCode });
    await trx('campaigns').where({ id: secondCampaignId }).update({ code: firstCode });

    return trx.commit();
  } catch (err) {
    await trx.rollback();
    throw err;
  }
};

const isFromSameOrganization = async function ({ firstCampaignId, secondCampaignId }) {
  const [firstCampaign, secondCampaign] = await Promise.all([
    knex('campaigns').select('organizationId').where({ id: firstCampaignId }).first(),
    knex('campaigns').select('organizationId').where({ id: secondCampaignId }).first(),
  ]);

  if (!firstCampaign || !secondCampaign) {
    throw new UnknownCampaignId();
  }

  return firstCampaign.organizationId === secondCampaign.organizationId;
};

const archiveCampaigns = function (campaignIds, userId) {
  return knex('campaigns').whereNull('archivedAt').whereInArray('id', campaignIds).update({
    archivedBy: userId,
    archivedAt: new Date(),
  });
};

export {
  archiveCampaigns,
  batchUpdate,
  get,
  getByCode,
  getByIds,
  isCodeAvailable,
  isFromSameOrganization,
  save,
  swapCampaignCodes,
  update,
};
