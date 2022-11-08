const CertificationCenterInvitation = require('../models/CertificationCenterInvitation');

module.exports = async function ({ email, certificationCenterId, certificationCenterInvitationRepository }) {
  let certificationCenterInvitation, isInvitationCreated;

  const alreadyExistingPendingInvitationForThisEmail =
    await certificationCenterInvitationRepository.findOnePendingByEmailAndCertificationCenterId({
      email,
      certificationCenterId,
    });
  const shouldCreateInvitation = !alreadyExistingPendingInvitationForThisEmail;

  if (shouldCreateInvitation) {
    const newInvitation = CertificationCenterInvitation.create({ email, certificationCenterId });
    certificationCenterInvitation = await certificationCenterInvitationRepository.create(newInvitation);
    isInvitationCreated = true;
  } else {
    certificationCenterInvitation = await certificationCenterInvitationRepository.update(
      alreadyExistingPendingInvitationForThisEmail
    );
    isInvitationCreated = false;
  }

  return { isInvitationCreated, certificationCenterInvitation };
};
