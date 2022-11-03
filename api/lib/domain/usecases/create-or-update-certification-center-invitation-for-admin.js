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
    return { created: true, certificationCenterInvitation: certificationCenterInvitationCreated };
  }

  const updatedCertificationCenterInvitation = await certificationCenterInvitationRepository.update(
    alreadyExistingPendingInvitationForThisEmail
  );
  return { created: false, certificationCenterInvitation: updatedCertificationCenterInvitation };
};
