const BookshelfCampaignParticipation = require('../data/campaign-participation');
const { NotFoundError } = require('../../domain/errors');
const queryBuilder = require('../utils/query-builder');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');

module.exports = {

  async get(id, options) {
    const campaignParticipation = await queryBuilder.get(BookshelfCampaignParticipation, id, options, false);

    return bookshelfToDomainConverter.buildDomainObject(
      BookshelfCampaignParticipation,
      campaignParticipation
    );
  },

  save(campaignParticipation) {
    return new BookshelfCampaignParticipation(_adaptModelToDb(campaignParticipation))
      .save()
      .then((campaignParticipationPersisted) => {
        return bookshelfToDomainConverter.buildDomainObject(
          BookshelfCampaignParticipation,
          campaignParticipationPersisted
        );
      });
  },

  find(options) {
    return queryBuilder.find(BookshelfCampaignParticipation, options);
  },

  // TODO: Replace this use-case specific version by adding inner-joins to query-builder
  findWithUsersPaginated(options) {
    return BookshelfCampaignParticipation
      .where(options.filter)
      .query((qb) => {
        qb.innerJoin('users', 'userId', 'users.id');
        qb.orderBy('users.lastName', 'asc');
      })
      .fetchPage({
        page: options.page.number,
        pageSize: options.page.size,
        withRelated: ['user']
      })
      .then((results) => {
        return {
          pagination: results.pagination,
          models: bookshelfToDomainConverter.buildDomainObjects(BookshelfCampaignParticipation, results.models)
        };
      });
  },

  updateCampaignParticipation(campaignParticipation) {
    return new BookshelfCampaignParticipation(campaignParticipation)
      .save({ isShared: true, sharedAt: new Date() }, { patch: true, require: true })
      .then((campaignParticipationPersisted) => {
        return bookshelfToDomainConverter.buildDomainObject(
          BookshelfCampaignParticipation,
          campaignParticipationPersisted
        );
      })
      .catch(_checkNotFoundError);
  },

  count(filters = {}) {
    return BookshelfCampaignParticipation.where(filters).count();
  },
};

function _adaptModelToDb(campaignParticipation) {
  return {
    assessmentId: campaignParticipation.assessmentId,
    campaignId: campaignParticipation.campaignId,
    participantExternalId: campaignParticipation.participantExternalId,
    userId: campaignParticipation.userId,
  };
}

function _checkNotFoundError(err) {
  if (err instanceof BookshelfCampaignParticipation.NotFoundError) {
    throw new NotFoundError('Participation non trouvée');
  }
  throw err;
}
