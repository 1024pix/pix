/**
 * @typedef {import('./index.js').SessionRepository} SessionRepository*
 */

import { NotFoundError } from '../../../../shared/domain/errors.js';

/**
 * @param {object} params
 * @param {number} params.sessionId
 * @param {string} params.address
 * @param {string} params.room
 * @param {string} params.date
 * @param {string} params.time
 * @param {string} params.examiner
 * @param {string} params.description
 * @param {SessionRepository} params.sessionRepository
 */
export async function updateSession({
  sessionId,
  address,
  room,
  date,
  time,
  examiner,
  description,
  sessionRepository,
}) {
  const session = await sessionRepository.get({ id: sessionId });

  if (!session) {
    throw new NotFoundError("La session n'existe pas ou son accès est restreint");
  }

  session.updateInfo({ address, room, date, time, examiner, description });

  await sessionRepository.updateInfo({
    id: sessionId,
    address,
    room,
    date,
    time,
    examiner,
    description,
  });

  return session;
}
