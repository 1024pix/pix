import * as injectedParticipationsForUserManagementRepository from '../../infrastructure/repositories/participations-for-user-management-repository.js';
const findCampaignParticipationsForUserManagement = async function ({
  userId,
  participationsForUserManagementRepository = injectedParticipationsForUserManagementRepository,
} = {}) {
  return participationsForUserManagementRepository.findByUserId(userId);
};

export { findCampaignParticipationsForUserManagement };
