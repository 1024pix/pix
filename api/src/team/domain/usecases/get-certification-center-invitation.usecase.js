import { AlreadyExistingInvitationError, CancelledInvitationError } from '../../../shared/domain/errors.js';
import * as injectedCertificationCenterInvitationRepository from '../../infrastructure/repositories/certification-center-invitation-repository.js';

/**
 * @param {Object} params
 * @param {string} params.certificationCenterInvitationId
 * @param {string} params.certificationCenterInvitationCode
 * @param {CertificationCenterInvitationRepository} params.certificationCenterInvitationRepository
 * @returns {Promise<CertificationCenterInvitation>}
 */
const getCertificationCenterInvitation = async function ({
  certificationCenterInvitationId,
  certificationCenterInvitationCode,
  certificationCenterInvitationRepository = injectedCertificationCenterInvitationRepository,
} = {}) {
  const foundCertificationCenterInvitation = await certificationCenterInvitationRepository.getByIdAndCode({
    id: certificationCenterInvitationId,
    code: certificationCenterInvitationCode,
  });

  if (foundCertificationCenterInvitation.isCancelled) {
    throw new CancelledInvitationError(`L'invitation avec l'id ${certificationCenterInvitationId} a été annulée.`);
  }

  if (foundCertificationCenterInvitation.isAccepted) {
    throw new AlreadyExistingInvitationError(
      `L'invitation avec l'id ${certificationCenterInvitationId} a déjà été acceptée.`,
    );
  }

  return foundCertificationCenterInvitation;
};

export { getCertificationCenterInvitation };
