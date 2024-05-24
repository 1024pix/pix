import { UncancellableCertificationCenterInvitationError } from '../../../../lib/domain/errors.js';

/**
 * @typedef {import('../models/CertificationCenterInvitation.js').CertificationCenterInvitation} CertificationCenterInvitation
 */

/**
 *
 * @param {string} certificationCenterInvitationId
 * @param {CertificationCenterInvitationRepository} certificationCenterInvitationRepository
 * @returns {Promise<CertificationCenterInvitation>}
 */
const cancelCertificationCenterInvitation = async function ({
  certificationCenterInvitationId,
  certificationCenterInvitationRepository,
}) {
  const foundCertificationCenterInvitation = await certificationCenterInvitationRepository.get(
    certificationCenterInvitationId,
  );
  if (!foundCertificationCenterInvitation.isPending) {
    throw new UncancellableCertificationCenterInvitationError();
  }
  return await certificationCenterInvitationRepository.markAsCancelled({ id: foundCertificationCenterInvitation.id });
};

export { cancelCertificationCenterInvitation };
