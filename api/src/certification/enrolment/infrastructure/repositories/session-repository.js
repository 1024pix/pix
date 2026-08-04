// @ts-check
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import { SessionEnrolment } from '../../domain/models/SessionEnrolment.js';

/**
 * @deprecated use create
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
    .select({
      id: 'sessions.id',
      invigilatorPassword: 'sessions.invigilatorPassword',
      accessCode: 'sessions.accessCode',
      date: 'sessions.date',
      time: 'sessions.time',
      address: 'sessions.address',
      room: 'sessions.room',
      examiner: 'sessions.examiner',
      description: 'sessions.description',
      version: 'sessions.version',
      finalizedAt: 'sessions.finalizedAt',
      createdBy: 'sessions.createdBy',
      certificationCenter: 'certification-centers.name',
      certificationCenterId: 'certification-centers.id',
      certificationCenterType: 'certification-centers.type',
    })
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
 * @param {object} params
 * @param {number} params.userId
 * @param {certificationCenterId} params.certificationCenterId
 * @param {string} params.address
 * @param {string} params.room
 * @param {string} params.date
 * @param {string} params.time
 * @param {string} params.examiner
 * @param {string} params.description
 * @param {string} params.accessCode
 * @param {string} params.invigilatorPassword
 * @returns {Promise<void>}
 */
export async function create({
  userId,
  certificationCenterId,
  address,
  room,
  examiner,
  date,
  time,
  description,
  accessCode,
  invigilatorPassword,
}) {
  const knexConn = DomainTransaction.getConnection();
  const [certificationCenter] = await knexConn
    .pluck('name')
    .from('certification-centers')
    .where({ id: certificationCenterId });
  const [{ id }] = await knexConn('sessions')
    .insert({
      createdBy: userId,
      certificationCenterId,
      address,
      room,
      examiner,
      date,
      time,
      description,
      accessCode,
      invigilatorPassword,
      certificationCenter,
      version: AlgorithmEngineVersion.V3,
    })
    .returning('id');
  return id;
}

/**
 * @function
 * @param {object} params
 * @param {number} params.id
 * @param {string} params.address
 * @param {string} params.room
 * @param {string} params.date
 * @param {string} params.time
 * @param {string} params.examiner
 * @param {string} params.description
 * @returns {Promise<void>}
 */
export async function updateInfo({ id, address, room, examiner, date, time, description }) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('sessions').where({ id }).update({ address, room, examiner, date, time, description });
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
