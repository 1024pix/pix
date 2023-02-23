const { CancelledInvitationError, AlreadyExistingInvitationError } = require('../errors.js');

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
    throw new CancelledInvitationError(`L'invitation avec l'id ${certificationCenterInvitationId} a été annulée.`);
  }

  if (foundCertificationCenterInvitation.isAccepted) {
    throw new AlreadyExistingInvitationError(
      `L'invitation avec l'id ${certificationCenterInvitationId} a déjà été acceptée.`
    );
  }

  return foundCertificationCenterInvitation;
};
