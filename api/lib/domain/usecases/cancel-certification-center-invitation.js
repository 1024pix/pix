const { UncancellableCertificationCenterInvitationError } = require('../../domain/errors.js');

module.exports = async function cancelCertificationCenterInvitation({
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
