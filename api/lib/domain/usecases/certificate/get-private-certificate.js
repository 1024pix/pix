const { NotFoundError } = require('../../errors');

module.exports = async function getPrivateCertificate({
  certificationId,
  userId,
  locale,
  privateCertificateRepository,
}) {
  const privateCertificate = await privateCertificateRepository.get(certificationId, { locale });
  if (privateCertificate.userId !== userId) {
    throw new NotFoundError();
  }

  return privateCertificate;
};
