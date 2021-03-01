const _ = require('lodash');

const FinalizedSessionBookshelf = require('../data/finalized-session');

const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');

module.exports = {

  async save(finalizedSession) {
    return await new FinalizedSessionBookshelf(_toDTO(finalizedSession)).save();
  },

  async get({ sessionId }) {
    const bookshelfFinalizedSession = await FinalizedSessionBookshelf
      .where({ sessionId })
      .fetch({ require: true });

    return bookshelfToDomainConverter.buildDomainObject(FinalizedSessionBookshelf, bookshelfFinalizedSession);
  },

  async updatePublishedAt({ sessionId, publishedAt }) {
    await FinalizedSessionBookshelf
      .where({ sessionId })
      .save({ publishedAt }, { method: 'update', require: false });
  },

  async findFinalizedSessionsToPublish() {
    const publishableFinalizedSessions = await FinalizedSessionBookshelf
      .where({ isPublishable: true, publishedAt: null })
      .orderBy('finalizedAt')
      .fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(FinalizedSessionBookshelf, publishableFinalizedSessions);
  },

  async findFinalizedSessionsWithRequiredAction() {
    const publishableFinalizedSessions = await FinalizedSessionBookshelf
      .where({ isPublishable: false, publishedAt: null })
      .orderBy('finalizedAt')
      .fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(FinalizedSessionBookshelf, publishableFinalizedSessions);
  },
};

function _toDTO(finalizedSession) {
  return _.omit(
    {
      ...finalizedSession,
      date: finalizedSession.sessionDate,
      time: finalizedSession.sessionTime,
    },
    ['sessionDate', 'sessionTime'],
  );
}
