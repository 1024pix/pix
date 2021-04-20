const bluebird = require('bluebird');

module.exports = async function findCompletedPrivateCertificates({
  userId,
  certificationRepository,
  cleaCertificationResultRepository,
}) {
  const certifications = await certificationRepository.findByUserId(userId);
  return bluebird.mapSeries(certifications, async (certification) => {
    const cleaCertificationResult = await cleaCertificationResultRepository.get(certification.id);
    certification.cleaCertificationResult = cleaCertificationResult;
    return certification;
  });
};
