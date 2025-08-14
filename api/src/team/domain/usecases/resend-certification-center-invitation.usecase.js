import * as injectedCertificationCenterRepository from '../../../certification/shared/infrastructure/repositories/certification-center-repository.js';
import * as injectedCertificationCenterInvitationRepository from '../../infrastructure/repositories/certification-center-invitation-repository.js';
import * as injectedCertificationCenterInvitationService from '../services/certification-center-invitation-service.js';
const resendCertificationCenterInvitation = async function ({
  certificationCenterInvitationId,
  locale,
  certificationCenterRepository = injectedCertificationCenterRepository,
  certificationCenterInvitationRepository = injectedCertificationCenterInvitationRepository,
  certificationCenterInvitationService = injectedCertificationCenterInvitationService,
} = {}) {
  const certificationCenterInvitation = await certificationCenterInvitationRepository.get(
    certificationCenterInvitationId,
  );
  const certificationCenter = await certificationCenterRepository.get({
    id: certificationCenterInvitation.certificationCenterId,
  });
  await certificationCenterInvitationService.resendCertificationCenterInvitation({
    certificationCenterInvitationRepository,
  })({
    certificationCenter,
    certificationCenterInvitation,
    locale,
  });

  return certificationCenterInvitationRepository.get(certificationCenterInvitationId);
};

export { resendCertificationCenterInvitation };
