const CertificationResultInformation = require('../read-models/CertificationResultInformation');

module.exports = async function getCertificationResultInformation({
  certificationCourseId,
  generalCertificationInformationRepository,
  assessmentResultRepository,
  cleaCertificationStatusRepository,
}) {
  const generalCertificationInformation = await generalCertificationInformationRepository.get({ certificationCourseId });
  const assessmentResult = await assessmentResultRepository.get({ certificationCourseId });
  const cleaCertificationStatus = await cleaCertificationStatusRepository.getCleaCertificationStatus(certificationCourseId);
  const certificationResultInformation = CertificationResultInformation.from({
    generalCertificationInformation,
    assessmentResult,
    cleaCertificationStatus,
  });
  return certificationResultInformation;
};
