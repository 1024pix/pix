const BookshelfCampaignParticipation = require('../data/campaign-participation');
const CampaignParticipation = require('../../domain/models/CampaignParticipation');
const Campaign = require('../../domain/models/Campaign');
const { NotFoundError } = require('../../domain/errors');
const fp = require('lodash/fp');

function _toDomain(bookshelfCampaignParticipation) {
  return new CampaignParticipation({
    id: bookshelfCampaignParticipation.get('id'),
    assessmentId: bookshelfCampaignParticipation.get('assessmentId'),
    campaign: new Campaign(bookshelfCampaignParticipation.related('campaign').toJSON()),
    campaignId: bookshelfCampaignParticipation.get('campaignId'),
    isShared: Boolean(bookshelfCampaignParticipation.get('isShared')),
    sharedAt: new Date(bookshelfCampaignParticipation.get('sharedAt')),
    createdAt: new Date(bookshelfCampaignParticipation.get('createdAt')),
    participantExternalId: bookshelfCampaignParticipation.get('participantExternalId'),
    userId: bookshelfCampaignParticipation.get('userId'),
  });
}

module.exports = {

  get(id) {
    return BookshelfCampaignParticipation
      .where({ id })
      .fetch({ require: true })
      .then(_toDomain)
      .catch(_checkNotFoundError);
  },

  save(campaignParticipation) {
    return new BookshelfCampaignParticipation(_adaptModelToDb(campaignParticipation))
      .save()
      .then(_toDomain);
  },

  findByCampaignId(campaignId) {
    return BookshelfCampaignParticipation
      .where({ campaignId })
      .fetchAll({ withRelated: ['campaign'] })
      .then((bookshelfCampaignParticipation) => bookshelfCampaignParticipation.models)
      .then(fp.map(_toDomain));
  },

  findByUserId(userId) {
    return BookshelfCampaignParticipation
      .where({ userId })
      .orderBy('createdAt', 'DESC')
      .fetchAll({ withRelated: ['campaign'] })
      .then((bookshelfCampaignParticipation) => bookshelfCampaignParticipation.models)
      .then(fp.map(_toDomain));
  },

  findByAssessmentId(assessmentId) {
    return BookshelfCampaignParticipation
      .where({ assessmentId })
      .fetch({ require: true, withRelated: ['campaign'] })
      .then(_toDomain)
      .catch(_checkNotFoundError);
  },

  updateCampaignParticipation(campaignParticipation) {
    return new BookshelfCampaignParticipation(campaignParticipation)
      .save({ isShared: true, sharedAt: new Date() }, { patch: true, require: true })
      .then(_toDomain)
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
    throw new NotFoundError();
  }
  throw err;
}
