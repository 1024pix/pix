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
export async function saveCompanionPing({
  userId,
  certificationCandidateRepository,
  temporaryCompanionStorageService,
}) {
  const companionPingInfo = await certificationCandidateRepository.findCompanionPingInfoByUserId({
    userId,
  });

  await temporaryCompanionStorageService.save(companionPingInfo);
}
