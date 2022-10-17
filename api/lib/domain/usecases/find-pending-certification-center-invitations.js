module.exports = async function findPendingCertificationCenterInvitations({
  certificationCenterId,
  certificationCenterInvitationRepository,
}) {
  return await certificationCenterInvitationRepository.findPendingByCertificationCenterId({ certificationCenterId });
};
