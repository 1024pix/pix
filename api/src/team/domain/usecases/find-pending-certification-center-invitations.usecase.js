import * as injectedCertificationCenterInvitationRepository from '../../infrastructure/repositories/certification-center-invitation-repository.js';
const findPendingCertificationCenterInvitations = async function ({
  certificationCenterId,
  certificationCenterInvitationRepository = injectedCertificationCenterInvitationRepository,
} = {}) {
  return await certificationCenterInvitationRepository.findPendingByCertificationCenterId({ certificationCenterId });
};

export { findPendingCertificationCenterInvitations };
