// @ts-check
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { SessionEnrolment } from '../../domain/models/SessionEnrolment.js';

/**
 * @function
 * @param {object} params
 * @param {SessionEnrolment} params.session
 * @returns {Promise<SessionEnrolment>}
 */
export async function save({ session }) {
  const knexConn = DomainTransaction.getConnection();
  const [savedSession] = await knexConn('sessions')
    .insert({
      accessCode: session.accessCode,
      address: session.address,
      certificationCenter: session.certificationCenter,
      date: session.date,
      description: session.description,
      examiner: session.examiner,
      room: session.room,
      time: session.time,
      certificationCenterId: session.certificationCenterId,
      invigilatorPassword: session.invigilatorPassword,
      version: session.version,
      createdBy: session.createdBy,
    })
    .returning('*');

  return new SessionEnrolment(savedSession);
}

/**
 * @function
 * @param {object} params
 * @param {number} params.id
 * @returns {Promise<SessionEnrolment>}
 * @throws {NotFoundError}
 */
export async function get({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const foundSession = await knexConn
    .select('sessions.*')
    .select({ certificationCenterType: 'certification-centers.type' })
    .from('sessions')
    .join('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
    .where('sessions.id', id)
    .first();
  if (!foundSession) {
    throw new NotFoundError("La session n'existe pas ou son accès est restreint");
  }
  return new SessionEnrolment({ ...foundSession, certificationCandidates: [] });
}

/**
 * @function
 * @param {object} params
 * @param {string} params.address
 * @param {string} params.room
 * @param {Date} params.date
 * @param {Date} params.time
 * @param {number} params.certificationCenterId
 * @param {number} [params.excludeSessionId]
 * @returns {Promise<boolean>}
 */
export async function isSessionExistingByCertificationCenterId({
  address,
  room,
  date,
  time,
  certificationCenterId,
  excludeSessionId,
}) {
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn('sessions').where({ address, room, date, time }).andWhere({ certificationCenterId });
  if (excludeSessionId) {
    query.andWhereNot({ id: excludeSessionId });
  }
  const sessions = await query;
  return sessions.length > 0;
}

/**
 * @function
 * @param {SessionEnrolment} session
 * @returns {Promise<void>}
 */
export async function update(session) {
  const knexConn = DomainTransaction.getConnection();
  const sessionDataToUpdate = {
    address: session.address,
    room: session.room,
    accessCode: session.accessCode,
    examiner: session.examiner,
    date: session.date,
    time: session.time,
    description: session.description,
  };

  await knexConn('sessions').where({ id: session.id }).update(sessionDataToUpdate);
}

/**
 * @function
 * @param {object} params
 * @param {number} params.id
 * @returns {Promise<void>}
 * @throws {NotFoundError}
 */
export async function remove({ id }) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('invigilator_accesses').where({ sessionId: id }).del();
  await knexConn('certification-candidates').where({ sessionId: id }).del();
  const nbSessionsDeleted = await knexConn('sessions').where({ id }).del();
  if (nbSessionsDeleted === 0) throw new NotFoundError();
}
