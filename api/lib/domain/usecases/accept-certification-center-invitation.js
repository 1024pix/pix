module.exports = async function acceptCertificationCenterInvitation({
  certificationCenterInvitationId,
  code,
  email,
  certificationCenterInvitedUserRepository,
}) {
  const certificationCenterInvitedUser = await certificationCenterInvitedUserRepository.get({
    certificationCenterInvitationId,
    email,
  });

  certificationCenterInvitedUser.acceptInvitation(code);
};
