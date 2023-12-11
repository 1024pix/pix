const resendCertificationCenterInvitation = async function ({
  certificationCenterInvitationId,
  locale,
  certificationCenterRepository,
  certificationCenterInvitationRepository,
  certificationCenterInvitationService,
}) {
  const certificationCenterInvitation = await certificationCenterInvitationRepository.get(
    certificationCenterInvitationId,
  );
  const certificationCenter = await certificationCenterRepository.get(
    certificationCenterInvitation.certificationCenterId,
  );
  await certificationCenterInvitationService.resendCertificationCenterInvitation({
    certificationCenterInvitationRepository,
  })({
    certificationCenter,
    certificationCenterInvitation,
    locale,
  });

  return certificationCenterInvitationRepository.get(certificationCenterInvitationId);
};

export { resendCertificationCenterInvitation };
