const createOrUpdateCertificationCenterInvitation = async function ({
  certificationCenterId,
  emails,
  locale,
  certificationCenterRepository,
  certificationCenterInvitationRepository,
  certificationCenterInvitationService,
}) {
  const certificationCenter = await certificationCenterRepository.get({ id: certificationCenterId });

  const uniqueEmails = [...new Set(emails)];
  const trimmedUniqueEmails = uniqueEmails.map((email) => email.replace(/[\s\r\n]/g, ''));

  for (const email of trimmedUniqueEmails) {
    await certificationCenterInvitationService.createOrUpdateCertificationCenterInvitation({
      certificationCenterInvitationRepository,
    })({
      certificationCenter,
      email,
      locale,
    });
  }
};

export { createOrUpdateCertificationCenterInvitation };
