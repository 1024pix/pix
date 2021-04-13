const _ = require('lodash');
const BookshelfCampaign = require('../data/campaign');
const { NotFoundError } = require('../../domain/errors');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const DomainTransaction = require('../DomainTransaction');

module.exports = {

  isCodeAvailable(code) {
    return BookshelfCampaign
      .where({ code })
      .fetch({ require: false })
      .then((campaign) => {
        if (campaign) {
          return false;
        }
        return true;
      });
  },

  async getByCode(code) {
    const bookshelfCampaign = await BookshelfCampaign
      .where({ code })
      .fetch({ require: false, withRelated: ['organization'] });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfCampaign, bookshelfCampaign);
  },

  async get(id, domainTransaction = DomainTransaction.emptyTransaction()) {
    const bookshelfCampaign = await BookshelfCampaign
      .where({ id })
      .fetch({
        withRelated: ['creator', 'organization', 'targetProfile'],
        transacting: domainTransaction.knexTransaction,
      })
      .catch((err) => {
        if (err instanceof BookshelfCampaign.NotFoundError) {
          throw new NotFoundError(`Not found campaign for ID ${id}`);
        }
        throw err;
      });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfCampaign, bookshelfCampaign);
  },

  async create(campaign) {
    const campaignAttributes = _.pick(campaign, [
      'name',
      'code',
      'title',
      'type',
      'idPixLabel',
      'customLandingPageText',
      'creatorId',
      'organizationId',
      'targetProfileId',
    ]);
    const createdCampaign = await (new BookshelfCampaign(campaignAttributes).save());
    return bookshelfToDomainConverter.buildDomainObject(BookshelfCampaign, createdCampaign);
  },

  async update(campaign) {
    const editedAttributes = _.pick(campaign, [
      'name',
      'title',
      'customLandingPageText',
      'archivedAt',
    ]);
    const bookshelfCampaign = await BookshelfCampaign.where({ id: campaign.id }).fetch();
    await bookshelfCampaign.save(editedAttributes, { method: 'update', patch: true });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfCampaign, bookshelfCampaign);
  },

  async checkIfUserOrganizationHasAccessToCampaign(campaignId, userId) {
    try {
      await BookshelfCampaign
        .query((qb) => {
          qb.where({ 'campaigns.id': campaignId, 'memberships.userId': userId, 'memberships.disabledAt': null });
          qb.innerJoin('memberships', 'memberships.organizationId', 'campaigns.organizationId');
          qb.innerJoin('organizations', 'organizations.id', 'campaigns.organizationId');
        })
        .fetch();
    } catch (e) {
      return false;
    }
    return true;
  },

  async checkIfCampaignIsArchived(campaignId) {
    const bookshelfCampaign = await BookshelfCampaign
      .where({ id: campaignId })
      .fetch();

    const campaign = bookshelfToDomainConverter.buildDomainObject(BookshelfCampaign, bookshelfCampaign);
    return campaign.isArchived();
  },
};
