import { getAttestationDataForUsers } from './get-attestation-data-for-users.js';
import { getAttestationDetails } from './get-attestation-details.js';
import { getProfileRewardsByUserId } from './get-profile-rewards-by-user-id.js';
import { getRewardByIdAndType } from './get-reward-by-id-and-type.js';
import { getSharedAttestationsForOrganizationByUserIds } from './get-shared-attestations-for-organization-by-user-ids.js';
import { getSharedAttestationsUserDetailForOrganizationByUserIds } from './get-shared-attestations-user-detail-for-organization-by-user-ids.js';
import { getUserProfile } from './get-user-profile.js';
import { rewardUser } from './reward-user.js';
import { shareProfileReward } from './share-profile-reward.js';

const usecases = {
  getAttestationDataForUsers,
  getAttestationDetails,
  getProfileRewardsByUserId,
  getRewardByIdAndType,
  getSharedAttestationsForOrganizationByUserIds,
  getSharedAttestationsUserDetailForOrganizationByUserIds,
  getUserProfile,
  rewardUser,
  shareProfileReward,
};

export { usecases };
