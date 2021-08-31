const JuryCertification = require('../models/JuryCertification');

module.exports = async function getJuryCertification({
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
  return JuryCertification.from({
    generalCertificationInformation,
    assessmentResult,
    cleaCertificationResult,
    pixPlusDroitMaitreCertificationResult,
    pixPlusDroitExpertCertificationResult,
  });
};
