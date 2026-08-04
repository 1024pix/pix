/**
 * @typedef {import ("./index.js").SessionRepository} SessionRepository
 * @typedef {import ("./index.js").SessionCodeService} SessionCodeService
 */

const INVIGILATOR_PASSWORD_LENGTH = 6;
const INVIGILATOR_PASSWORD_CHARS = '23456789bcdfghjkmpqrstvwxyBCDFGHJKMPQRSTVWXY!*?'.split('');
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
  const accessCode = sessionCodeService.getNewSessionCode();
  const invigilatorPassword = generateInvigilatorPassword();
  return sessionRepository.create({
    userId,
    certificationCenterId,
    address,
    room,
    date,
    time,
    examiner,
    description,
    accessCode,
    invigilatorPassword,
  });
}

function generateInvigilatorPassword() {
  const chars = Array.from(INVIGILATOR_PASSWORD_CHARS);
  for (let i = INVIGILATOR_PASSWORD_LENGTH; i >= 0; i--) {
    const j = Math.floor(Math.random() * (chars.length - 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.slice(0, INVIGILATOR_PASSWORD_LENGTH).join('');
}
