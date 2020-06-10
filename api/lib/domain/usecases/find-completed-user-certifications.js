const bluebird = require('bluebird');

module.exports = async function findCompletedUserCertifications({ userId, certificationRepository, cleaCertificationStatusRepository }) {
  const certifications = await certificationRepository.findByUserId(userId);
  return bluebird.mapSeries(certifications, async (certification) => {
    const cleaCertificationStatus = await cleaCertificationStatusRepository.getCleaCertificationStatus(certification.id);
    certification.cleaCertificationStatus = cleaCertificationStatus;
    return certification;
  });
};
