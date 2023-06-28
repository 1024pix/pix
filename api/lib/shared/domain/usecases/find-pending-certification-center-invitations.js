const findPendingCertificationCenterInvitations = async function ({
  certificationCenterId,
  certificationCenterInvitationRepository,
}) {
  return await certificationCenterInvitationRepository.findPendingByCertificationCenterId({ certificationCenterId });
};

export { findPendingCertificationCenterInvitations };
