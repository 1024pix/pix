const _ = require('lodash');
const { NotFoundError } = require('../../domain/errors');

const FinalizedSessionBookshelf = require('../data/finalized-session');

const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');

module.exports = {

  async save(finalizedSession) {
    const foundSession = await FinalizedSessionBookshelf.where({ sessionId: finalizedSession.sessionId }).fetch({ require: false });

    if (foundSession) {
      return FinalizedSessionBookshelf
        .where({ sessionId: finalizedSession.sessionId })
        .save(_toDTO(finalizedSession), { method: 'update', require: false });
    }

    return new FinalizedSessionBookshelf(_toDTO(finalizedSession), { method: 'insert' }).save();
  },

  async get({ sessionId }) {
    const bookshelfFinalizedSession = await FinalizedSessionBookshelf
      .where({ sessionId })
      .fetch({ require: false });

    if (bookshelfFinalizedSession) {
      return bookshelfToDomainConverter.buildDomainObject(FinalizedSessionBookshelf, bookshelfFinalizedSession);
    }

    throw new NotFoundError(`Session of id ${sessionId} does not exist.`);
  },

  async updatePublishedAt({ sessionId, publishedAt }) {
    await FinalizedSessionBookshelf
      .where({ sessionId })
      .save({ publishedAt }, { method: 'update', require: false });
  },

  async findFinalizedSessionsToPublish() {
    const publishableFinalizedSessions = await FinalizedSessionBookshelf
      .where({ isPublishable: true, publishedAt: null, assignedCertificationOfficerName: null })
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
