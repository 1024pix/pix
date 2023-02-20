export default async function findPendingCertificationCenterInvitations({
  certificationCenterId,
  certificationCenterInvitationRepository,
}) {
  return await certificationCenterInvitationRepository.findPendingByCertificationCenterId({ certificationCenterId });
}
