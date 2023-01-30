const _ = require('lodash');
const BookshelfCampaign = require('../orm-models/Campaign');
const { NotFoundError } = require('../../domain/errors');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const { knex } = require('../../../db/knex-database-connection');
const Campaign = require('../../domain/models/Campaign');
const targetProfileRepository = require('./target-profile-repository');
const skillRepository = require('./skill-repository');
const Stage = require('../../domain/models/Stage');

const CAMPAIGNS_TABLE = 'campaigns';

module.exports = {
  async isCodeAvailable(code) {
    return !Boolean(await knex('campaigns').first('id').where({ code }));
  },

  async getByCode(code) {
    const bookshelfCampaign = await BookshelfCampaign.where({ code }).fetch({
      require: false,
      withRelated: ['organization'],
    });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfCampaign, bookshelfCampaign);
  },

  async get(id) {
    const bookshelfCampaign = await BookshelfCampaign.where({ id })
      .fetch({
        withRelated: ['creator', 'organization', 'targetProfile'],
      })
      .catch((err) => {
        if (err instanceof BookshelfCampaign.NotFoundError) {
          throw new NotFoundError(`Not found campaign for ID ${id}`);
        }
        throw err;
      });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfCampaign, bookshelfCampaign);
  },

  async save(campaign) {
    const trx = await knex.transaction();
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
    ]);
    try {
      const [createdCampaignDTO] = await trx(CAMPAIGNS_TABLE).insert(campaignAttributes).returning('*');
      const createdCampaign = new Campaign(createdCampaignDTO);
      if (createdCampaign.isAssessment()) {
        const cappedTubes = await trx('target-profile_tubes')
          .select('tubeId', 'level')
          .where('targetProfileId', campaignAttributes.targetProfileId);
        const skillData = [];
        if (cappedTubes.length > 0) {
          for (const cappedTube of cappedTubes) {
            const allLevelSkills = await skillRepository.findActiveByTubeId(cappedTube.tubeId);
            const rightLevelSkills = allLevelSkills.filter((skill) => skill.difficulty <= cappedTube.level);
            skillData.push(...rightLevelSkills.map((skill) => ({ skillId: skill.id, campaignId: createdCampaign.id })));
          }
        } else {
          const skillIds = await trx('target-profiles_skills')
            .pluck('skillId')
            .distinct()
            .where('targetProfileId', campaignAttributes.targetProfileId);
          skillData.push(...skillIds.map((skillId) => ({ skillId, campaignId: createdCampaign.id })));
        }
        await trx.batchInsert('campaign_skills', skillData);
      }
      await trx.commit();
      return createdCampaign;
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  },

  async update(campaign) {
    const editedAttributes = _.pick(campaign, [
      'name',
      'title',
      'customLandingPageText',
      'archivedAt',
      'archivedBy',
      'ownerId',
    ]);

    const [editedCampaign] = await knex('campaigns').update(editedAttributes).where({ id: campaign.id }).returning('*');

    return new Campaign(editedCampaign);
  },

  async checkIfUserOrganizationHasAccessToCampaign(campaignId, userId) {
    try {
      await BookshelfCampaign.query((qb) => {
        qb.where({ 'campaigns.id': campaignId, 'memberships.userId': userId, 'memberships.disabledAt': null });
        qb.innerJoin('memberships', 'memberships.organizationId', 'campaigns.organizationId');
        qb.innerJoin('organizations', 'organizations.id', 'campaigns.organizationId');
      }).fetch();
    } catch (e) {
      return false;
    }
    return true;
  },

  async checkIfCampaignIsArchived(campaignId) {
    const bookshelfCampaign = await BookshelfCampaign.where({ id: campaignId }).fetch();

    const campaign = bookshelfToDomainConverter.buildDomainObject(BookshelfCampaign, bookshelfCampaign);
    return campaign.isArchived();
  },

  async getCampaignTitleByCampaignParticipationId(campaignParticipationId) {
    const campaign = await knex('campaigns')
      .select('title')
      .join('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
      .where({ 'campaign-participations.id': campaignParticipationId })
      .first();

    if (!campaign) return null;
    return campaign.title;
  },

  async getCampaignCodeByCampaignParticipationId(campaignParticipationId) {
    const campaign = await knex('campaigns')
      .select('code')
      .join('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
      .where({ 'campaign-participations.id': campaignParticipationId })
      .first();

    if (!campaign) return null;
    return campaign.code;
  },

  async getCampaignIdByCampaignParticipationId(campaignParticipationId) {
    const campaign = await knex('campaigns')
      .select('campaigns.id')
      .join('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
      .where({ 'campaign-participations.id': campaignParticipationId })
      .first();

    if (!campaign) return null;
    return campaign.id;
  },

  async findSkillIds({ campaignId, domainTransaction, filterByStatus = 'operative' }) {
    if (filterByStatus === 'all') {
      return _findSkillIds({ campaignId, domainTransaction });
    }
    const skills = await this.findSkills({ campaignId, domainTransaction, filterByStatus });
    return skills.map(({ id }) => id);
  },

  findSkills({ campaignId, domainTransaction, filterByStatus }) {
    return _findSkills({ campaignId, domainTransaction, filterByStatus });
  },

  async findSkillsByCampaignParticipationId({ campaignParticipationId, domainTransaction }) {
    const knexConn = domainTransaction?.knexTransaction ?? knex;
    const [campaignId] = await knexConn('campaign-participations')
      .where({ id: campaignParticipationId })
      .pluck('campaignId');
    return this.findSkills({ campaignId });
  },

  async findSkillIdsByCampaignParticipationId({ campaignParticipationId, domainTransaction }) {
    const skills = await this.findSkillsByCampaignParticipationId({ campaignParticipationId, domainTransaction });
    return skills.map(({ id }) => id);
  },

  async findStages({ campaignId }) {
    const stages = await knex('stages')
      .select('stages.*')
      .join('campaigns', 'campaigns.targetProfileId', 'stages.targetProfileId')
      .where('campaigns.id', campaignId)
      .orderBy(['stages.threshold', 'stages.level']);

    await _computeStagesThresholdForCampaign(stages, campaignId);

    return stages.map((stage) => new Stage(stage));
  },
};

async function _findSkills({ campaignId, domainTransaction, filterByStatus = 'operative' }) {
  const skillIds = await _findSkillIds({ campaignId, domainTransaction });
  switch (filterByStatus) {
    case 'operative':
      return skillRepository.findOperativeByIds(skillIds);
    case 'all':
      return skillRepository.findByRecordIds(skillIds);
    default:
      throw new TypeError(`unknown filterByStatus value "${filterByStatus}", use "operative" or "all"`);
  }
}

async function _findSkillIds({ campaignId, domainTransaction }) {
  const knexConn = domainTransaction?.knexTransaction ?? knex;
  let skillIds = await knexConn('campaign_skills').where({ campaignId }).pluck('skillId');
  // TODO remove it after target profile skills migration
  if (skillIds.length === 0) {
    skillIds = await targetProfileRepository.getTargetProfileSkillIdsByCampaignId(campaignId, domainTransaction);
  }
  return skillIds;
}

async function _computeStagesThresholdForCampaign(stages, campaignId) {
  const stagesWithLevel = stages.filter((stage) => stage.level);

  if (stagesWithLevel.length === 0) return;

  const skills = await _findSkills({ campaignId });

  stagesWithLevel.forEach((stage) => {
    stage.threshold = _computeStageThresholdForLevel(stage.level, skills);
  });
}

const MAX_STAGE_THRESHOLD = 100;

function _computeStageThresholdForLevel(level, skills) {
  if (skills.length === 0) {
    return MAX_STAGE_THRESHOLD;
  }

  const stageSkillsCount = skills.filter((skill) => skill.difficulty <= level).length;
  return Math.round((stageSkillsCount / skills.length) * 100);
}
