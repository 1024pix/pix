const CertificationResultInformation = require('../read-models/CertificationResultInformation');

module.exports = async function getCertificationResultInformation({
  certificationCourseId,
  generalCertificationInformationRepository,
  assessmentResultRepository,
  cleaCertificationResultRepository,
  pixPlusDroitMaitreCertificationResultRepository,
  pixPlusDroitExpertCertificationResultRepository,
}) {
  const generalCertificationInformation = await generalCertificationInformationRepository.get({ certificationCourseId });
  const assessmentResult = await assessmentResultRepository.getByCertificationCourseId({ certificationCourseId });
  const cleaCertificationResult = await cleaCertificationResultRepository.get({ certificationCourseId });
  const pixPlusDroitMaitreCertificationResult = await pixPlusDroitMaitreCertificationResultRepository.get({ certificationCourseId });
  const pixPlusDroitExpertCertificationResult = await pixPlusDroitExpertCertificationResultRepository.get({ certificationCourseId });
  return CertificationResultInformation.from({
    generalCertificationInformation,
    assessmentResult,
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
  });
};
