/**
 * @typedef {import ("./index.js").CenterRepository} CenterRepository
 * @typedef {import ("./index.js").SessionRepository} SessionRepository
 * @typedef {import ("./index.js").SessionValidator} SessionValidator
 * @typedef {import ("./index.js").SessionCodeService} SessionCodeService
 */

import * as injectedSessionValidator from '../../../shared/domain/validators/session-validator.js';
import { SessionEnrolment } from '../models/SessionEnrolment.js';
import * as injectedSessionCodeService from '../services/session-code-service.js';

/**
 * @param {Object} params
 * @param {CenterRepository} params.centerRepository
 * @param {SessionRepository} params.sessionRepository
 * @param {SessionValidator} params.sessionValidator
 * @param {SessionCodeService} params.sessionCodeService
 */
const createSession = async function ({
  userId,
  session,
  centerRepository,
  sessionRepository,
  sessionValidator = injectedSessionValidator,
  sessionCodeService = injectedSessionCodeService,
} = {}) {
  sessionValidator.validate(session);

  const certificationCenterId = session.certificationCenterId;

  const accessCode = sessionCodeService.getNewSessionCode();
  const { name: certificationCenterName } = await centerRepository.getById({
    id: certificationCenterId,
  });

  const domainSession = new SessionEnrolment({
    ...session,
    accessCode,
    certificationCenter: certificationCenterName,
    certificationCandidates: [],
    createdBy: userId,
  });

  return sessionRepository.save({ session: domainSession });
};

export { createSession };
