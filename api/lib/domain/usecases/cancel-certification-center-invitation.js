import { UncancellableCertificationCenterInvitationError } from '../../domain/errors';

export default async function cancelCertificationCenterInvitation({
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
}
