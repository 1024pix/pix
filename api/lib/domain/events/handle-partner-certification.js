const { checkEventType } = require('./check-event-type');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');

const eventType = CertificationScoringCompleted;

async function handlePartnerCertifications({
  event,
  partnerCertificationRepository,
}) {
  checkEventType(event, eventType);
  const partnerCertification = await partnerCertificationRepository.buildCleaCertification({
    certificationCourseId: event.certificationCourseId,
    userId: event.userId,
    reproducibilityRate: event.reproducibilityRate,
  });

  if (partnerCertification.isEligible()) {
    await partnerCertificationRepository.save({ partnerCertification });
  }
}

handlePartnerCertifications.eventType = eventType;
module.exports = handlePartnerCertifications;
