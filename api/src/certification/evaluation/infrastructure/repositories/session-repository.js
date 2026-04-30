import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { Session } from '../../domain/models/Session.js';

export async function get({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const sessionDTO = await knexConn('sessions')
    .select(
      'id',
      'date',
      'time',
      'accessCode',
      'finalizedAt',
      'publishedAt',
      knexConn('certification-courses')
        .select(knexConn.raw('1'))
        .whereRaw('?? = ??', ['certification-courses.sessionId', 'sessions.id'])
        .limit(1)
        .as('hasStarted'),
    )
    .where('id', id)
    .first();

  if (!sessionDTO) {
    throw new NotFoundError('Session does not exist');
  }

  return _toDomain(sessionDTO);
}

export async function getByCertificationCourseId({ certificationCourseId }) {
  const knexConn = DomainTransaction.getConnection();
  const sessionDTO = await knexConn('sessions')
    .select({
      id: 'sessions.id',
      date: 'sessions.date',
      time: 'sessions.time',
      accessCode: 'sessions.accessCode',
      finalizedAt: 'sessions.finalizedAt',
      publishedAt: 'sessions.publishedAt',
    })
    .join('certification-courses', 'certification-courses.sessionId', 'sessions.id')
    .where('certification-courses.id', certificationCourseId)
    .first();

  if (!sessionDTO) {
    throw new NotFoundError('Certification course does not exist');
  }

  return _toDomain({
    ...sessionDTO,
    hasStarted: true,
  });
}

export async function update(session) {
  const sessionData = {
    date: session.date,
    time: session.time,
  };

  const knexConn = DomainTransaction.getConnection();
  await knexConn('sessions').update(sessionData).where({ id: session.id });
}

function _toDomain(sessionDTO) {
  return new Session({
    id: sessionDTO.id,
    date: sessionDTO.date,
    time: sessionDTO.time,
    accessCode: sessionDTO.accessCode,
    finalizedAt: sessionDTO.finalizedAt,
    publishedAt: sessionDTO.publishedAt,
    hasStarted: !!sessionDTO.hasStarted,
  });
}
