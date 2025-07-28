import { AlreadyExistingMembershipError } from '../../../shared/domain/errors.js';

const acceptOrganizationInvitation = async function ({
  organizationInvitationId,
  code,
  email,
  locale,
  organizationInvitationRepository,
  organizationInvitedUserRepository,
  userRepository,
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

  if (locale) {
    const user = await userRepository.get(organizationInvitedUser.userId);
    user.setLocaleIfNotAlreadySet(locale);
    if (user.hasBeenModified) {
      await userRepository.update({ id: user.id, locale: user.locale });
    }
  }

  await organizationInvitedUserRepository.save({ organizationInvitedUser });
  return { id: organizationInvitedUser.currentMembershipId, isAdmin: organizationInvitedUser.currentRole === 'ADMIN' };
};

export { acceptOrganizationInvitation };
