/**
 * @typedef {import('./index.js').CertificationCandidateRepository} CertificationCandidateRepository
 * @typedef {import('./index.js').TemporaryCompanionStorageService} TemporaryCompanionStorageService
 */

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

  await temporaryCompanionStorageService.save(certificationCandidateCompanion);
};

export { saveCompanionPing };
