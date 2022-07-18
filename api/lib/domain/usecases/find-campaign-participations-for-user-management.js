module.exports = async function findCampaignParticipationsForUserManagement({
  userId,
  participationsForUserManagementRepository,
}) {
  return participationsForUserManagementRepository.findByUserId(userId);
};
