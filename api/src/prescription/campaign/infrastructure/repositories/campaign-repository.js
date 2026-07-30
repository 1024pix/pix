import { CAMPAIGN_FEATURES } from '../../../../shared/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import * as skillRepository from '../../../../shared/infrastructure/repositories/skill-repository.js';
import * as tubeRepository from '../../../../shared/infrastructure/repositories/tube-repository.js';
import { Campaign } from '../../domain/models/Campaign.js';

const getByCode = async function (code) {
  const knexConn = DomainTransaction.getConnection();
  const campaignData = await baseQuery(knexConn).where('campaigns.code', code).first();
  if (!campaignData) {
    return null;
  }

  return new Campaign({
    ...campaignData,
    ...{ externalIdLabel: campaignData?.params?.label, externalIdType: campaignData?.params?.type },
  });
};

const get = async function (id) {
  const knexConn = DomainTransaction.getConnection();
  const campaignData = await baseQuery(knexConn).where('campaigns.id', id).first();
  if (!campaignData) {
    throw new NotFoundError(`Not found campaign for ID ${id}`);
  }

  return new Campaign({
    ...campaignData,
    ...{ externalIdLabel: campaignData?.params?.label, externalIdType: campaignData?.params?.type },
  });
};

const getByCampaignParticipationId = async function (campaignParticipationId) {
  const knexConn = DomainTransaction.getConnection();
  const campaignData = await baseQuery(knexConn)
    .join('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
    .where({ 'campaign-participations.id': campaignParticipationId })
    .first();
  if (!campaignData) {
    return null;
  }

  return new Campaign({
    ...campaignData,
    ...{ externalIdLabel: campaignData?.params?.label, externalIdType: campaignData?.params?.type },
  });
};

const getCampaignIdByCampaignParticipationId = async function (campaignParticipationId) {
  const campaign = await getByCampaignParticipationId(campaignParticipationId);
  if (!campaign) return null;
  return campaign.id;
};

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

const checkIfUserOrganizationHasAccessToCampaign = async function (campaignId, userId) {
  const knexConn = DomainTransaction.getConnection();

  const campaign = await knexConn('campaigns')
    .innerJoin('memberships', 'memberships.organizationId', 'campaigns.organizationId')
    .innerJoin('organizations', 'organizations.id', 'campaigns.organizationId')
    .where({ 'campaigns.id': campaignId, 'memberships.userId': userId, 'memberships.disabledAt': null })
    .first('campaigns.id');
  return Boolean(campaign);
};

async function _findSkillIds(campaignIds) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('campaign_skills').whereIn('campaignId', campaignIds).pluck('skillId');
}

const findSkillIds = async function ({ campaignId, filterByStatus = 'operative' }) {
  if (filterByStatus === 'all') {
    return _findSkillIds([campaignId]);
  }
  const skills = await findSkills({ campaignId, filterByStatus });
  return skills.map(({ id }) => id);
};

async function _findSkills(campaignIds, filterByStatus = 'operative') {
  const skillIds = await _findSkillIds(campaignIds);
  switch (filterByStatus) {
    case 'operative':
      return skillRepository.findOperativeByIds(skillIds);
    case 'all':
      return skillRepository.findByRecordIds(skillIds);
    default:
      throw new TypeError(`unknown filterByStatus value "${filterByStatus}", use "operative" or "all"`);
  }
}

const findSkills = async function ({ campaignId, filterByStatus }) {
  return _findSkills([campaignId], filterByStatus);
};

const findSkillsByCampaignParticipationId = async function ({ campaignParticipationId }) {
  const knexConn = DomainTransaction.getConnection();
  const [campaignId] = await knexConn('campaign-participations')
    .where({ id: campaignParticipationId })
    .pluck('campaignId');
  return findSkills({ campaignId });
};

const findSkillIdsByCampaignParticipationIds = async function ({ campaignParticipationIds }) {
  const knexConn = DomainTransaction.getConnection();
  const campaignIds = await knexConn('campaign-participations')
    .whereIn('id', campaignParticipationIds)
    .pluck('campaignId');
  const skills = await _findSkills(campaignIds);
  return [...new Set(skills)].map(({ id }) => id);
};

const findSkillIdsByCampaignParticipationId = async function ({ campaignParticipationId }) {
  return findSkillIdsByCampaignParticipationIds({ campaignParticipationIds: [campaignParticipationId] });
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
  const tubes = await tubeRepository.findByRecordIds(tubeIds);
  const skillIds = tubes.flatMap((tube) => tube.skillIds);
  return skillRepository.findByRecordIds(skillIds);
};

export {
  areKnowledgeElementsResettable,
  checkIfUserOrganizationHasAccessToCampaign,
  findAllSkills,
  findSkillIds,
  findSkillIdsByCampaignParticipationId,
  findSkillIdsByCampaignParticipationIds,
  findSkills,
  findSkillsByCampaignParticipationId,
  findTubes,
  get,
  getByCampaignParticipationId,
  getByCode,
  getCampaignIdByCampaignParticipationId,
};

function baseQuery(knexConn) {
  return knexConn
    .select('campaigns.*', 'campaign-features.params')
    .from('campaigns')
    .leftJoin('features', function () {
      this.onVal('features.key', CAMPAIGN_FEATURES.EXTERNAL_ID.key);
    })
    .leftJoin('campaign-features', function () {
      this.on('campaign-features.campaignId', '=', 'campaigns.id').andOn(
        'campaign-features.featureId',
        '=',
        'features.id',
      );
    });
}
