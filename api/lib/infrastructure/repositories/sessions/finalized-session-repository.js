import _ from 'lodash';
import { NotFoundError } from '../../../domain/errors.js';
import { knex } from '../../bookshelf.js';
import { BookshelfFinalizedSession } from '../../orm-models/FinalizedSession.js';

import * as bookshelfToDomainConverter from '../../utils/bookshelf-to-domain-converter.js';
import { FinalizedSession } from '../../../domain/models/index.js';

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

const findFinalizedSessionsWithRequiredAction = async function ({ version } = {}) {
  const versionFilter = version ? { 'sessions.version': version } : {};
  const publishableFinalizedSessions = await knex('finalized-sessions')
    .innerJoin('sessions', 'finalized-sessions.sessionId', 'sessions.id')
    .where({
      ...versionFilter,
      isPublishable: false,
      'finalized-sessions.publishedAt': null,
    })
    .select('finalized-sessions.*')
    .orderBy('finalized-sessions.finalizedAt');

  return publishableFinalizedSessions.map(_toDomainObject);
};

export { save, get, findFinalizedSessionsToPublish, findFinalizedSessionsWithRequiredAction };

function _toDomainObject({ date, time, ...finalizedSession }) {
  return new FinalizedSession({
    ...finalizedSession,
    sessionDate: date,
    sessionTime: time,
  });
}

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
