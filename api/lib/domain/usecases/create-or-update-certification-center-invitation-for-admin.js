const CertificationCenterInvitation = require('../models/CertificationCenterInvitation');

module.exports = async function ({ email, certificationCenterId, certificationCenterInvitationRepository }) {
  const newInvitation = CertificationCenterInvitation.create({ email, certificationCenterId });
  const certificationCenterInvitationCreated = await certificationCenterInvitationRepository.create(newInvitation);
  return { created: true, certificationCenterInvitation: certificationCenterInvitationCreated };
};
