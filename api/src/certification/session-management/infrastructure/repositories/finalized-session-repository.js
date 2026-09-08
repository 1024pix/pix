import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { FinalizedSession } from '../../domain/models/FinalizedSession.js';

export async function save({ finalizedSession }) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('finalized-sessions').insert(_toDTO(finalizedSession)).onConflict('sessionId').merge();
  return finalizedSession;
}

export async function remove({ sessionId }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('finalized-sessions').where({ sessionId }).delete();
}

export async function get({ sessionId }) {
  const knexConn = DomainTransaction.getConnection();
  const finalizedSessionDto = await knexConn('finalized-sessions').where({ sessionId }).first();

  if (!finalizedSessionDto) {
    throw new NotFoundError(`Session of id ${sessionId} does not exist.`);
  }

  return _toDomainObject(finalizedSessionDto);
}

export async function findFinalizedSessionsToPublish({ version } = {}) {
  const knexConn = DomainTransaction.getConnection();
  const versionFilter = version ? { 'sessions.version': version } : {};
  const publishableFinalizedSessions = await knexConn('finalized-sessions')
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
}

export async function findFinalizedSessionsWithRequiredAction({ version } = {}) {
  const knexConn = DomainTransaction.getConnection();
  const versionFilter = version ? { 'sessions.version': version } : {};
  const publishableFinalizedSessions = await knexConn('finalized-sessions')
    .innerJoin('sessions', 'finalized-sessions.sessionId', 'sessions.id')
    .where({
      ...versionFilter,
      isPublishable: false,
      'finalized-sessions.publishedAt': null,
    })
    .select('finalized-sessions.*')
    .orderBy('finalized-sessions.finalizedAt', 'DESC');

  return publishableFinalizedSessions.map(_toDomainObject);
}

function _toDomainObject({ date, time, ...finalizedSession }) {
  return new FinalizedSession({
    ...finalizedSession,
    sessionDate: date,
    sessionTime: time,
  });
}

function _toDTO(finalizedSession) {
  // eslint-disable-next-line no-unused-vars
  const { sessionDate, sessionTime, ...filteredFinalizedSession } = finalizedSession;
  return { ...filteredFinalizedSession, date: finalizedSession.sessionDate, time: finalizedSession.sessionTime };
}
