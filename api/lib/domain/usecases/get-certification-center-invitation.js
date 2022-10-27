const {
  AlreadyExistingCertificationCenterInvitationError,
  CancelledCertificationCenterInvitationError,
} = require('../../domain/errors');

module.exports = async function getCertificationCenterInvitation({
  certificationCenterInvitationId,
  certificationCenterInvitationCode,
  certificationCenterInvitationRepository,
}) {
  const foundCertificationCenterInvitation = await certificationCenterInvitationRepository.getByIdAndCode({
    id: certificationCenterInvitationId,
    code: certificationCenterInvitationCode,
  });

  if (foundCertificationCenterInvitation.isCancelled) {
    throw new CancelledCertificationCenterInvitationError('Invitation was cancelled');
  }

  if (foundCertificationCenterInvitation.isAccepted) {
    throw new AlreadyExistingCertificationCenterInvitationError(
      `Invitation already accepted with the id ${certificationCenterInvitationId}`
    );
  }

  return foundCertificationCenterInvitation;
};
