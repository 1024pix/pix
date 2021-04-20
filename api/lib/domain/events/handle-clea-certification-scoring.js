const { checkEventType } = require('./check-event-type');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');

const eventType = CertificationScoringCompleted;

async function handleCleaCertificationScoring({
  event,
  partnerCertificationScoringRepository,
}) {
  checkEventType(event, eventType);
  const cleaCertificationScoring = await partnerCertificationScoringRepository.buildCleaCertificationScoring({
    certificationCourseId: event.certificationCourseId,
    userId: event.userId,
    reproducibilityRate: event.reproducibilityRate,
  });

  if (cleaCertificationScoring.isEligible()) {
    await partnerCertificationScoringRepository.save({ partnerCertificationScoring: cleaCertificationScoring });
  }
}

handleCleaCertificationScoring.eventType = eventType;
module.exports = handleCleaCertificationScoring;
