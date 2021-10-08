const { NotFoundError } = require('../../errors');

module.exports = async function getPrivateCertificate({ certificationId, userId, privateCertificateRepository }) {
  const privateCertificate = await privateCertificateRepository.get(certificationId);
  if (privateCertificate.userId !== userId) {
    throw new NotFoundError();
  }

  return privateCertificate;
};
