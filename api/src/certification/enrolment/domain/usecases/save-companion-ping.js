/**
 * @typedef {import('./index.js').CertificationCandidateRepository} CertificationCandidateRepository
 * @typedef {import('./index.js').TemporaryCompanionStorageService} TemporaryCompanionStorageService
 */

import { NotFoundError } from '../../../../shared/domain/errors.js';

/**
 * @param {Object} params
 * @param {number} params.userId
 * @param {CertificationCandidateRepository} params.certificationCandidateRepository
 * @param {TemporaryCompanionStorageService} params.temporaryCompanionStorageService
 */
const saveCompanionPing = async function ({
  userId,
  certificationCandidateRepository,
  temporaryCompanionStorageService,
}) {
  const certificationCandidateCompanion =
    await certificationCandidateRepository.findCertificationCandidateCompanionInfoByUserId({ userId });
  if (!certificationCandidateCompanion) {
    throw new NotFoundError(`User ${userId} is not found in a certification's session`);
  }
  await temporaryCompanionStorageService.save(certificationCandidateCompanion);
};

export { saveCompanionPing };
