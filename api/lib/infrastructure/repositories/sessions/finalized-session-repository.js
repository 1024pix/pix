import _ from 'lodash';
import { NotFoundError } from '../../../../src/shared/domain/errors.js';
import { knex } from '../../bookshelf.js';
import { BookshelfFinalizedSession } from '../../orm-models/FinalizedSession.js';

import * as bookshelfToDomainConverter from '../../utils/bookshelf-to-domain-converter.js';

const save = async function (finalizedSession) {
  await knex('finalized-sessions').insert(_toDTO(finalizedSession)).onConflict('sessionId').merge();
  return finalizedSession;
};

const get = async function ({ sessionId }) {
  const bookshelfFinalizedSession = await BookshelfFinalizedSession.where({ sessionId }).fetch({ require: false });

  if (bookshelfFinalizedSession) {
    return bookshelfToDomainConverter.buildDomainObject(BookshelfFinalizedSession, bookshelfFinalizedSession);
  }

  throw new NotFoundError(`Session of id ${sessionId} does not exist.`);
};

const findFinalizedSessionsToPublish = async function () {
  const publishableFinalizedSessions = await BookshelfFinalizedSession.where({
    isPublishable: true,
    publishedAt: null,
    assignedCertificationOfficerName: null,
  })
    .orderBy('finalizedAt')
    .fetchAll();

  return bookshelfToDomainConverter.buildDomainObjects(BookshelfFinalizedSession, publishableFinalizedSessions);
};

const findFinalizedSessionsWithRequiredAction = async function () {
  const publishableFinalizedSessions = await BookshelfFinalizedSession.where({
    isPublishable: false,
    publishedAt: null,
  })
    .orderBy('finalizedAt')
    .fetchAll();

  return bookshelfToDomainConverter.buildDomainObjects(BookshelfFinalizedSession, publishableFinalizedSessions);
};

export { save, get, findFinalizedSessionsToPublish, findFinalizedSessionsWithRequiredAction };

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
