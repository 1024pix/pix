import bluebird from 'bluebird';

const createOrUpdateCertificationCenterInvitation = async function ({
  certificationCenterId,
  emails,
  locale,
  certificationCenterRepository,
  certificationCenterInvitationRepository,
  certificationCenterInvitationService,
}) {
  const certificationCenter = await certificationCenterRepository.get(certificationCenterId);

  const uniqueEmails = [...new Set(emails)];
  const trimmedUniqueEmails = uniqueEmails.map((email) => email.replace(/[\s\r\n]/g, ''));

  return bluebird.mapSeries(trimmedUniqueEmails, (email) =>
    certificationCenterInvitationService.createOrUpdateCertificationCenterInvitation({
      certificationCenterInvitationRepository,
    })({
      certificationCenter,
      email,
      locale,
    }),
  );
};

export { createOrUpdateCertificationCenterInvitation };
