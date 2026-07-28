import { UserHasNoOrganizationMembershipError } from '../../../team/domain/errors.js';

/**
 * @param {Object} params
 * @param {string} params.userId
 * @param {PrescriberRepository} params.prescriberRepository
 * @param {MembershipRepository} params.membershipRepository
 * @param {UserOrgaSettingsRepository} params.userOrgaSettingsRepository
 * @return {Promise<Prescriber>}
 * @throws {UserHasNoOrganizationMembershipError}
 */
export const getPrescriber = async function ({
  userId,
  prescriberRepository,
  membershipRepository,
  userOrgaSettingsRepository,
}) {
  const memberships = await membershipRepository.findByUserId(userId);
  if (memberships?.length === 0) {
    throw new UserHasNoOrganizationMembershipError();
  }

  const firstOrganizationId = memberships[0].organizationId;

  const userOrgaSettings = await userOrgaSettingsRepository.findOneByUserId(userId);
  if (!userOrgaSettings) {
    await userOrgaSettingsRepository.create(userId, firstOrganizationId);
  } else if (!_isCurrentOrganizationInMemberships(userOrgaSettings, memberships)) {
    await userOrgaSettingsRepository.update(userId, firstOrganizationId);
  }
  return prescriberRepository.getPrescriber({ userId });
};

function _isCurrentOrganizationInMemberships(userOrgaSettings, memberships) {
  const currentOrganizationId = userOrgaSettings.currentOrganization.id;
  return memberships.find((membership) => membership.organizationId === currentOrganizationId);
}
