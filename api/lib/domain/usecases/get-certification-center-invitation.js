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
    throw new CancelledCertificationCenterInvitationError("L'invitation à ce centre de certification a été annulée.");
  }

  if (foundCertificationCenterInvitation.isAccepted) {
    throw new AlreadyExistingCertificationCenterInvitationError(
      `L'invitation avec l'id ${certificationCenterInvitationId} existe déjà.`
    );
  }

  return foundCertificationCenterInvitation;
};
