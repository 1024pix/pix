// @ts-check
import _ from 'lodash';

import { knex } from '../../../../../db/knex-database-connection.js';
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
 * @returns {Promise<boolean>}
 */
export async function isSessionExistingByCertificationCenterId({ address, room, date, time, certificationCenterId }) {
  const sessions = await knex('sessions').where({ address, room, date, time }).andWhere({ certificationCenterId });
  return sessions.length > 0;
}

/**
 * @function
 * @param {object} params
 * @param {number} params.sessionId
 * @param {number} params.certificationCenterId
 * @returns {Promise<boolean>}
 */
export async function isSessionExistingBySessionAndCertificationCenterIds({ sessionId, certificationCenterId }) {
  const [session] = await knex('sessions').where({ id: sessionId, certificationCenterId });
  return Boolean(session);
}

/**
 * @function
 * @param {SessionEnrolment} session
 * @returns {Promise<void>}
 */
export async function update(session) {
  const sessionDataToUpdate = _.pick(session, [
    'address',
    'room',
    'accessCode',
    'examiner',
    'date',
    'time',
    'description',
  ]);

  await knex('sessions').where({ id: session.id }).update(sessionDataToUpdate);
}

/**
 * @function
 * @param {object} params
 * @param {number} params.id
 * @returns {Promise<void>}
 * @throws {NotFoundError}
 */
export async function remove({ id }) {
  await knex.transaction(async (trx) => {
    const certificationCandidateIdsInSession = await trx('certification-candidates')
      .where({ sessionId: id })
      .pluck('id');
    const invigilatorAccessIds = await trx('invigilator_accesses').where({ sessionId: id }).pluck('id');

    if (invigilatorAccessIds) {
      await trx('invigilator_accesses').whereIn('id', invigilatorAccessIds).del();
    }

    if (certificationCandidateIdsInSession.length) {
      await trx('certification-subscriptions')
        .whereIn('certificationCandidateId', certificationCandidateIdsInSession)
        .del();
      await trx('certification-candidates').whereIn('id', certificationCandidateIdsInSession).del();
    }
    const nbSessionsDeleted = await trx('sessions').where('id', id).del();
    if (nbSessionsDeleted === 0) throw new NotFoundError();
  });
}
