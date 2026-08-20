/**
 * @typedef {import ("./index.js").SessionRepository} SessionRepository
 * @typedef {import ("./index.js").SessionCodeService} SessionCodeService
 */

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
 * @param {SessionRepository} params.sessionRepository
 * @param {SessionCodeService} params.sessionCodeService
 */
export async function createSession({
  userId,
  certificationCenterId,
  address,
  room,
  date,
  time,
  examiner,
  description,
  sessionRepository,
  sessionCodeService,
}) {
  return sessionRepository.create({
    userId,
    certificationCenterId,
    address,
    room,
    date,
    time,
    examiner,
    description,
    accessCode: sessionCodeService.getNewSessionCode(),
    invigilatorPassword: sessionCodeService.getNewInvigilatorPassword(),
  });
}
