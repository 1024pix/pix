const { checkEventType } = require('./check-event-type');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');

const eventType = CertificationScoringCompleted;

async function handleCertificationAcquisitionForPartner({
  event,
  domainTransaction,
  certificationPartnerAcquisitionRepository,
}) {
  checkEventType(event, eventType);
  const cleaPartnerAcquisition = await certificationPartnerAcquisitionRepository.buildCertificationCleaAcquisition({
    certificationCourseId: event.certificationCourseId,
    userId: event.userId,
    reproducibilityRate: event.reproducibilityRate,
    domainTransaction });

  if (cleaPartnerAcquisition.isEligible()) {
    await certificationPartnerAcquisitionRepository.save(cleaPartnerAcquisition, domainTransaction);
  }
}

handleCertificationAcquisitionForPartner.eventType = eventType;
module.exports = handleCertificationAcquisitionForPartner;
