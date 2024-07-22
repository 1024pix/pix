import { knex } from '../../../db/knex-database-connection.js';
import { tubeDatasource } from '../../../src/shared/infrastructure/datasources/learning-content/tube-datasource.js';
import * as skillRepository from '../../../src/shared/infrastructure/repositories/skill-repository.js';
import { NotFoundError } from '../../domain/errors.js';
import { Campaign } from '../../domain/models/Campaign.js';
import { DomainTransaction } from '../DomainTransaction.js';

const areKnowledgeElementsResettable = async function ({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn('campaigns')
    .join('target-profiles', function () {
      this.on('target-profiles.id', 'campaigns.targetProfileId').andOnVal(
        'target-profiles.areKnowledgeElementsResettable',
        'true',
      );
    })
    .where({ 'campaigns.id': id, 'campaigns.multipleSendings': true })
    .first();
  return Boolean(result);
};

const getByCode = async function (code) {
  const campaign = await knex('campaigns').first().where({ code });
  if (!campaign) return null;
  return new Campaign({ ...campaign, organization: { id: campaign.organizationId } });
};

const get = async function (id) {
  const campaign = await knex('campaigns').where({ id }).first();
  if (!campaign) {
    throw new NotFoundError(`Not found campaign for ID ${id}`);
  }
  return new Campaign({
    ...campaign,
    organization: { id: campaign.organizationId },
    targetProfile: { id: campaign.targetProfileId },
    creator: { id: campaign.creatorId },
  });
};

const checkIfUserOrganizationHasAccessToCampaign = async function (campaignId, userId) {
  const campaign = await knex('campaigns')
    .innerJoin('memberships', 'memberships.organizationId', 'campaigns.organizationId')
    .innerJoin('organizations', 'organizations.id', 'campaigns.organizationId')
    .where({ 'campaigns.id': campaignId, 'memberships.userId': userId, 'memberships.disabledAt': null })
    .first('campaigns.id');
  return Boolean(campaign);
};

const getCampaignTitleByCampaignParticipationId = async function (campaignParticipationId) {
  const campaign = await knex('campaigns')
    .select('title')
    .join('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
    .where({ 'campaign-participations.id': campaignParticipationId })
    .first();

  if (!campaign) return null;
  return campaign.title;
};

const getCampaignCodeByCampaignParticipationId = async function (campaignParticipationId) {
  const campaign = await knex('campaigns')
    .select('code')
    .join('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
    .where({ 'campaign-participations.id': campaignParticipationId })
    .first();

  if (!campaign) return null;
  return campaign.code;
};

const getCampaignIdByCampaignParticipationId = async function (campaignParticipationId) {
  const knexConn = DomainTransaction.getConnection();
  const campaign = await knexConn('campaigns')
    .select('campaigns.id')
    .join('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
    .where({ 'campaign-participations.id': campaignParticipationId })
    .first();

  if (!campaign) return null;
  return campaign.id;
};

const findSkillIds = async function ({ campaignId, filterByStatus = 'operative' }) {
  if (filterByStatus === 'all') {
    return _findSkillIds({ campaignId });
  }
  const skills = await this.findSkills({ campaignId, filterByStatus });
  return skills.map(({ id }) => id);
};

const findSkills = function ({ campaignId, filterByStatus }) {
  return _findSkills({ campaignId, filterByStatus });
};

const findSkillsByCampaignParticipationId = async function ({ campaignParticipationId }) {
  const knexConn = DomainTransaction.getConnection();
  const [campaignId] = await knexConn('campaign-participations')
    .where({ id: campaignParticipationId })
    .pluck('campaignId');
  return this.findSkills({ campaignId });
};

const findSkillIdsByCampaignParticipationId = async function ({ campaignParticipationId }) {
  const skills = await this.findSkillsByCampaignParticipationId({ campaignParticipationId });
  return skills.map(({ id }) => id);
};

const findTubes = async function ({ campaignId }) {
  const knexConn = DomainTransaction.getConnection();

  return await knexConn('target-profile_tubes')
    .pluck('tubeId')
    .join('campaigns', 'campaigns.targetProfileId', 'target-profile_tubes.targetProfileId')
    .where('campaigns.id', campaignId);
};

const findAllSkills = async function ({ campaignId }) {
  const tubeIds = await findTubes({ campaignId });
  const tubes = await tubeDatasource.findByRecordIds(tubeIds);
  const skillIds = tubes.flatMap((tube) => tube.skillIds);
  return skillRepository.findByRecordIds(skillIds);
};

export {
  areKnowledgeElementsResettable,
  checkIfUserOrganizationHasAccessToCampaign,
  findAllSkills,
  findSkillIds,
  findSkillIdsByCampaignParticipationId,
  findSkills,
  findSkillsByCampaignParticipationId,
  findTubes,
  get,
  getByCode,
  getCampaignCodeByCampaignParticipationId,
  getCampaignIdByCampaignParticipationId,
  getCampaignTitleByCampaignParticipationId,
};

async function _findSkills({ campaignId, filterByStatus = 'operative' }) {
  const skillIds = await _findSkillIds({ campaignId });
  switch (filterByStatus) {
    case 'operative':
      return skillRepository.findOperativeByIds(skillIds);
    case 'all':
      return skillRepository.findByRecordIds(skillIds);
    default:
      throw new TypeError(`unknown filterByStatus value "${filterByStatus}", use "operative" or "all"`);
  }
}

async function _findSkillIds({ campaignId }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('campaign_skills').where({ campaignId }).pluck('skillId');
}
