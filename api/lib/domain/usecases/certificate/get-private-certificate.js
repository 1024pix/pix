const { NotFoundError } = require('../../errors.js');

module.exports = async function getPrivateCertificate({ certificationId, userId, locale, certificateRepository }) {
  const privateCertificate = await certificateRepository.getPrivateCertificate(certificationId, { locale });
  if (privateCertificate.userId !== userId) {
    throw new NotFoundError();
  }

  return privateCertificate;
};
