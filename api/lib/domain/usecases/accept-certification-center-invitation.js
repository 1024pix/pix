import { AlreadyExistingMembershipError } from '../errors.js';

const acceptCertificationCenterInvitation = async function ({
  certificationCenterInvitationId,
  code,
  email,
  localeFromCookie,
  certificationCenterInvitedUserRepository,
  certificationCenterMembershipRepository,
  userRepository,
}) {
  const certificationCenterInvitedUser = await certificationCenterInvitedUserRepository.get({
    certificationCenterInvitationId,
    email,
  });

  const userId = certificationCenterInvitedUser.userId;
  const certificationCenterId = certificationCenterInvitedUser.invitation.certificationCenterId;

  const certificationCenterMembersCount =
    await certificationCenterMembershipRepository.countActiveMembersForCertificationCenter(certificationCenterId);

  if (!certificationCenterInvitedUser.role) {
    certificationCenterInvitedUser.role = certificationCenterMembersCount > 0 ? 'MEMBER' : 'ADMIN';
  }

  const isMembershipExisting = await certificationCenterMembershipRepository.isMemberOfCertificationCenter({
    userId,
    certificationCenterId,
  });

  if (isMembershipExisting) {
    throw new AlreadyExistingMembershipError(
      `Certification center membership already exists for the user ID ${userId} and certification center ID ${certificationCenterId}.`,
    );
  }

  if (localeFromCookie) {
    const user = await userRepository.getById(userId);
    user.setLocaleIfNotAlreadySet(localeFromCookie);
    if (user.hasBeenModified) {
      await userRepository.update({ id: user.id, locale: user.locale });
    }
  }

  certificationCenterInvitedUser.acceptInvitation(code);

  await certificationCenterInvitedUserRepository.save(certificationCenterInvitedUser);
};

export { acceptCertificationCenterInvitation };
