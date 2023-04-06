const { AlreadyExistingMembershipError } = require('../../domain/errors.js');

module.exports = async function acceptOrganizationInvitation({
  organizationInvitationId,
  code,
  email,
  localeFromCookie,
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

  if (localeFromCookie) {
    const user = await userRepository.getById(organizationInvitedUser.userId);
    user.setLocaleIfNotAlreadySet(localeFromCookie);
    if (user.hasBeenModified) {
      await userRepository.update({ id: user.id, locale: user.locale });
    }
  }

  await organizationInvitedUserRepository.save({ organizationInvitedUser });
  return { id: organizationInvitedUser.currentMembershipId, isAdmin: organizationInvitedUser.currentRole === 'ADMIN' };
};
