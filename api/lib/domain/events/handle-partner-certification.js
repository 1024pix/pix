const { checkEventType } = require('./check-event-type');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');

const eventType = CertificationScoringCompleted;

async function handlePartnerCertifications({
  event,
  domainTransaction,
  partnerCertificationRepository,
}) {
  checkEventType(event, eventType);
  const partnerCertification = await partnerCertificationRepository.buildCleaCertification({
    certificationCourseId: event.certificationCourseId,
    userId: event.userId,
    reproducibilityRate: event.reproducibilityRate,
    domainTransaction
  });

  if (partnerCertification.isEligible()) {
    await partnerCertificationRepository.save({ partnerCertification, domainTransaction });
  }
}

handlePartnerCertifications.eventType = eventType;
module.exports = handlePartnerCertifications;
