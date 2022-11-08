const CertificationCenterInvitation = require('../models/CertificationCenterInvitation');

module.exports = async function ({ email, certificationCenterId, certificationCenterInvitationRepository }) {
  const alreadyExistingPendingInvitationForThisEmail =
    await certificationCenterInvitationRepository.findOnePendingByEmailAndCertificationCenterId({
      email,
      certificationCenterId,
    });

  const shouldCreateInvitation = !alreadyExistingPendingInvitationForThisEmail;
  if (shouldCreateInvitation) {
    const newInvitation = CertificationCenterInvitation.create({ email, certificationCenterId });
    const certificationCenterInvitationCreated = await certificationCenterInvitationRepository.create(newInvitation);
    return { isInvitationCreated: true, certificationCenterInvitation: certificationCenterInvitationCreated };
  }

  const updatedCertificationCenterInvitation = await certificationCenterInvitationRepository.update(
    alreadyExistingPendingInvitationForThisEmail
  );
  return { isInvitationCreated: false, certificationCenterInvitation: updatedCertificationCenterInvitation };
};
