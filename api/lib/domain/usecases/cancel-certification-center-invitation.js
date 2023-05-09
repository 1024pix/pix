import { UncancellableCertificationCenterInvitationError } from '../../domain/errors.js';

const cancelCertificationCenterInvitation = async function ({
  certificationCenterInvitationId,
  certificationCenterInvitationRepository,
}) {
  const foundCertificationCenterInvitation = await certificationCenterInvitationRepository.get(
    certificationCenterInvitationId
  );
  if (!foundCertificationCenterInvitation.isPending) {
    throw new UncancellableCertificationCenterInvitationError();
  }
  return await certificationCenterInvitationRepository.markAsCancelled({ id: foundCertificationCenterInvitation.id });
};

export { cancelCertificationCenterInvitation };
