const _ = require('lodash');
const BookshelfCampaign = require('../orm-models/Campaign');
const { NotFoundError } = require('../../domain/errors');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const { knex } = require('../../../db/knex-database-connection');

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
    const editedAttributes = _.pick(campaign, ['name', 'title', 'customLandingPageText', 'archivedAt', 'ownerId']);
    const bookshelfCampaign = await BookshelfCampaign.where({ id: campaign.id }).fetch();
    await bookshelfCampaign.save(editedAttributes, { method: 'update', patch: true });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfCampaign, bookshelfCampaign);
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
};
