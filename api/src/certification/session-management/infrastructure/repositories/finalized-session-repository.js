import _ from 'lodash';

import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { FinalizedSession } from '../../../../shared/domain/models/index.js';

const save = async function ({ finalizedSession }) {
  await knex('finalized-sessions').insert(_toDTO(finalizedSession)).onConflict('sessionId').merge();
  return finalizedSession;
};

const remove = async function ({ sessionId }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('finalized-sessions').where({ sessionId }).delete();
};

const get = async function ({ sessionId }) {
  const finalizedSessionDto = await knex('finalized-sessions').where({ sessionId }).first();

  if (!finalizedSessionDto) {
    throw new NotFoundError(`Session of id ${sessionId} does not exist.`);
  }

  return _toDomainObject(finalizedSessionDto);
};

const findFinalizedSessionsToPublish = async function ({ version } = {}) {
  const versionFilter = version ? { 'sessions.version': version } : {};
  const publishableFinalizedSessions = await knex('finalized-sessions')
    .innerJoin('sessions', 'finalized-sessions.sessionId', 'sessions.id')
    .where({
      ...versionFilter,
      isPublishable: true,
      'finalized-sessions.publishedAt': null,
      assignedCertificationOfficerName: null,
    })
    .select('finalized-sessions.*')
    .orderBy('finalized-sessions.finalizedAt');

  return publishableFinalizedSessions.map(_toDomainObject);
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

export { findFinalizedSessionsToPublish, findFinalizedSessionsWithRequiredAction, get, remove, save };

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
