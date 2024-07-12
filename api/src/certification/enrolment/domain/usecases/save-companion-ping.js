import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';

/**
 * @typedef {import('./index.js').CertificationCandidateRepository} CertificationCandidateRepository
 * @typedef {import('./index.js').TemporaryCompanionStorageService} TemporaryCompanionStorageService
 */

export const saveCompanionPing = withTransaction(
  /**
   * @param {{
   *   userId: number
   *   certificationCandidateRepository: CertificationCandidateRepository
   *   temporaryCompanionStorageService: TemporaryCompanionStorageService
   * }} params
   */
  async function saveCompanionPing({ userId, certificationCandidateRepository, temporaryCompanionStorageService }) {
    const companionPingInfo = await certificationCandidateRepository.findCompanionPingInfoByUserId({
      userId,
    });

    await temporaryCompanionStorageService.save(companionPingInfo);
  },
  {
    readOnly: true,
  },
);
