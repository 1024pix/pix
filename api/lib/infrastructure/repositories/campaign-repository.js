const _ = require('lodash');
const BookshelfCampaign = require('../orm-models/Campaign');
const { NotFoundError } = require('../../domain/errors');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const { knex } = require('../../../db/knex-database-connection');
const Campaign = require('../../domain/models/Campaign');
const targetProfileRepository = require('./target-profile-repository');
const skillRepository = require('./skill-repository');

module.exports = {
  isCodeAvailable(code) {
    return BookshelfCampaign.where({ code })
      .fetch({ require: false })
      .then((campaign) => {
        if (campaign) {
          return false;
        }
        return true;
      });
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

    const createdCampaign = await new BookshelfCampaign(campaignAttributes).save();
    return bookshelfToDomainConverter.buildDomainObject(BookshelfCampaign, createdCampaign);
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

  async findSkillIds({ campaignId, domainTransaction }) {
    const skills = await this.findSkills({ campaignId, domainTransaction });
    return skills.map(({ id }) => id);
  },

  async findSkills({ campaignId, domainTransaction, filterByStatus = 'operative' }) {
    const knexConn = domainTransaction?.knexTransaction ?? knex;
    let skillIds = await knexConn('campaign_skills').where({ campaignId }).pluck('skillId');
    // TODO remove it after target profile skills migration
    if (skillIds.length === 0) {
      skillIds = await targetProfileRepository.getTargetProfileSkillIdsByCampaignId(campaignId, domainTransaction);
    }
    switch (filterByStatus) {
      case 'operative':
        return skillRepository.findOperativeByIds(skillIds);
      case 'all':
        return skillRepository.findByRecordIds(skillIds);
      default:
        throw new TypeError(`unknown filterByStatus value "${filterByStatus}", use "operative" or "all"`);
    }
  },

  async findSkillsByCampaignParticipationId({ campaignParticipationId, domainTransaction }) {
    const knexConn = domainTransaction?.knexTransaction ?? knex;
    const [campaignId] = await knexConn('campaign-participations')
      .where({ id: campaignParticipationId })
      .pluck('campaignId');
    return this.findSkills({ campaignId });
  },

  async findSkillIdsByCampaignParticipationId({ campaignParticipationId, domainTransaction }) {
    return (await this.findSkillsByCampaignParticipationId({ campaignParticipationId, domainTransaction })).map(
      ({ id }) => id
    );
  },
};
