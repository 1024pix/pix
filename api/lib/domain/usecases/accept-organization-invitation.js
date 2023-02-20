import { AlreadyExistingMembershipError } from '../../domain/errors';

export default async function acceptOrganizationInvitation({
  organizationInvitationId,
  code,
  email,
  organizationInvitationRepository,
  organizationInvitedUserRepository,
}) {
  const organizationInvitedUser = await organizationInvitedUserRepository.get({ organizationInvitationId, email });

  try {
    organizationInvitedUser.acceptInvitation({ code });
  } catch (error) {
    if (error instanceof AlreadyExistingMembershipError) {
      await organizationInvitationRepository.markAsAccepted(organizationInvitationId);
    }
    throw error;
  }

  await organizationInvitedUserRepository.save({ organizationInvitedUser });
  return { id: organizationInvitedUser.currentMembershipId, isAdmin: organizationInvitedUser.currentRole === 'ADMIN' };
}
