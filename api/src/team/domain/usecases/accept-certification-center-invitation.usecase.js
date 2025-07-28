import { AlreadyExistingMembershipError } from '../../../shared/domain/errors.js';

const acceptCertificationCenterInvitation = async function ({
  certificationCenterInvitationId,
  code,
  email,
  locale,
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

  if (locale) {
    const user = await userRepository.get(userId);
    user.setLocaleIfNotAlreadySet(locale);
    if (user.hasBeenModified) {
      await userRepository.update({ id: user.id, locale: user.locale });
    }
  }

  certificationCenterInvitedUser.acceptInvitation(code);

  await certificationCenterInvitedUserRepository.save(certificationCenterInvitedUser);
};

export { acceptCertificationCenterInvitation };
