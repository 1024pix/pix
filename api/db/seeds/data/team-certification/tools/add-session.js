/**
 * @typedef {import('../../../../../src/certification/enrolment/domain/models/SessionEnrolment.js').SessionEnrolment} SessionEnrolment
 */
import { usecases as enrolmentUseCases } from '../../../../../src/certification/enrolment/domain/usecases/index.js';
import * as sessionRepository from '../../../../../src/certification/enrolment/infrastructure/repositories/session-repository.js';

/**
 * @param {Object} params
 * @param {Object} params.databaseBuilder
 * @param {number} params.createdByUserId - certification center member user id
 * @param {number} params.[forceSessionId] - allow for a stable and fixed session ID
 * @param {SessionEnrolment} params.session - session details you can customize
 * @returns {Promise<SessionEnrolment>}
 */
export default async function addSession({ databaseBuilder, createdByUserId, forceSessionId, session }) {
  const { certificationCenterId, address, room, date, time, examiner, description } = session;

  const generatedSessionId = await enrolmentUseCases.createSession({
    userId: createdByUserId,
    certificationCenterId,
    address,
    room,
    date,
    time,
    examiner,
    description,
  });

  const sessionId = forceSessionId || generatedSessionId;
  await databaseBuilder.knex('sessions').where('id', generatedSessionId).update({
    id: sessionId,
    accessCode: 'AZERTY',
  });
  await databaseBuilder.commit();

  return sessionRepository.get({ id: sessionId });
}
