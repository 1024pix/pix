/**
 * @typedef {import('./index.js').SessionRepository} SessionRepository*
 */

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
  return sessionRepository.updateInfo({ id: sessionId, address, room, date, time, examiner, description });
}
