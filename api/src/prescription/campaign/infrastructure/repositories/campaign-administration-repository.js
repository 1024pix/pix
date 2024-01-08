import _ from 'lodash';
import { knex } from '../../../../../db/knex-database-connection.js';
import * as skillRepository from '../../../../../lib/infrastructure/repositories/skill-repository.js';
import { Campaign } from '../../domain/read-models/Campaign.js';
import crypto from 'crypto';
import { UnknownCampaignId } from '../../domain/errors.js';

const get = async function (id) {
  const campaign = await knex('campaigns').where({ id }).first();

  if (!campaign) return null;

  return new Campaign({
    ...campaign,
    organization: { id: campaign.organizationId },
    targetProfile: { id: campaign.targetProfileId },
    creator: { id: campaign.creatorId },
  });
};

const update = async function (campaign) {
  const editedAttributes = _.pick(campaign, ['name', 'title', 'customLandingPageText', 'ownerId']);

  const [editedCampaign] = await knex('campaigns').update(editedAttributes).where({ id: campaign.id }).returning('*');

  return new Campaign(editedCampaign);
};

const save = async function (campaigns, dependencies = { skillRepository }) {
  const trx = await knex.transaction();
  const campaignsToCreate = _.isArray(campaigns) ? campaigns : [campaigns];

  try {
    let latestCreatedCampaign;
    for (const campaign of campaignsToCreate) {
      const campaignAttributes = _.pick(campaign, [
        'name',
        'code',
        'title',
        'type',
        'idPixLabel',
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
      ]);
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

const isCodeAvailable = async function (code) {
  return !(await knex('campaigns').first('id').where({ code }));
};

const swapCampaignCodes = async function ({ firstCampaignId, secondCampaignId }) {
  const trx = await knex.transaction();
  const temporaryCode = crypto.randomBytes(16).toString('base64');

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

export { save, update, get, isCodeAvailable, swapCampaignCodes, isFromSameOrganization };
