export default async function findCampaignParticipationsForUserManagement({
  userId,
  participationsForUserManagementRepository,
}) {
  return participationsForUserManagementRepository.findByUserId(userId);
}
