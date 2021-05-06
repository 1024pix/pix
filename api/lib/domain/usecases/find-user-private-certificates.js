const bluebird = require('bluebird');

module.exports = async function findUserPrivateCertificates({ userId, privateCertificateRepository, cleaCertificationStatusRepository }) {
  const privateCertificates = await privateCertificateRepository.findByUserId({ userId });
  return bluebird.mapSeries(privateCertificates, async (privateCertificate) => {
    const cleaCertificationStatus = await cleaCertificationStatusRepository.getCleaCertificationStatus(privateCertificate.id);
    privateCertificate.cleaCertificationStatus = cleaCertificationStatus;
    return privateCertificate;
  });
};
