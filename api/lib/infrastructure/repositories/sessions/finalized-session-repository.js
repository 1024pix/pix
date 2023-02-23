const _ = require('lodash');
const { NotFoundError } = require('../../../domain/errors.js');
const { knex } = require('../../bookshelf.js');

const FinalizedSessionBookshelf = require('../../orm-models/FinalizedSession.js');

const bookshelfToDomainConverter = require('../../utils/bookshelf-to-domain-converter.js');

module.exports = {
  async save(finalizedSession) {
    await knex('finalized-sessions').insert(_toDTO(finalizedSession)).onConflict('sessionId').merge();
    return finalizedSession;
  },

  async get({ sessionId }) {
    const bookshelfFinalizedSession = await FinalizedSessionBookshelf.where({ sessionId }).fetch({ require: false });

    if (bookshelfFinalizedSession) {
      return bookshelfToDomainConverter.buildDomainObject(FinalizedSessionBookshelf, bookshelfFinalizedSession);
    }

    throw new NotFoundError(`Session of id ${sessionId} does not exist.`);
  },

  async findFinalizedSessionsToPublish() {
    const publishableFinalizedSessions = await FinalizedSessionBookshelf.where({
      isPublishable: true,
      publishedAt: null,
      assignedCertificationOfficerName: null,
    })
      .orderBy('finalizedAt')
      .fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(FinalizedSessionBookshelf, publishableFinalizedSessions);
  },

  async findFinalizedSessionsWithRequiredAction() {
    const publishableFinalizedSessions = await FinalizedSessionBookshelf.where({
      isPublishable: false,
      publishedAt: null,
    })
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
    ['sessionDate', 'sessionTime']
  );
}
