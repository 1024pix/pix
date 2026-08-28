import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { Session } from '../../domain/models/Session.js';

/**
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @returns {Promise<Session|null>} the session, or null when no certification course matches
 */
export async function getByCertificationCourseId({ certificationCourseId }) {
  const knexConn = DomainTransaction.getConnection();
  const sessionDTO = await knexConn('sessions')
    .select({
      id: 'sessions.id',
      finalizedAt: 'sessions.finalizedAt',
      publishedAt: 'sessions.publishedAt',
    })
    .join('certification-courses', 'certification-courses.sessionId', 'sessions.id')
    .where('certification-courses.id', certificationCourseId)
    .first();

  if (!sessionDTO) {
    return null;
  }

  return _toDomain(sessionDTO);
}

function _toDomain(sessionDTO) {
  return new Session({
    id: sessionDTO.id,
    finalizedAt: sessionDTO.finalizedAt,
    publishedAt: sessionDTO.publishedAt,
  });
}
