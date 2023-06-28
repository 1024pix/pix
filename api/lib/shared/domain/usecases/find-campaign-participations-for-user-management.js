const findCampaignParticipationsForUserManagement = async function ({
  userId,
  participationsForUserManagementRepository,
}) {
  return participationsForUserManagementRepository.findByUserId(userId);
};

export { findCampaignParticipationsForUserManagement };
