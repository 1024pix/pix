module.exports = async function acceptCertificationCenterInvitation({
  certificationCenterInvitationId,
  email,
  certificationCenterInvitedUserRepository,
}) {
  return await certificationCenterInvitedUserRepository.get({
    certificationCenterInvitationId,
    email,
  });
};
