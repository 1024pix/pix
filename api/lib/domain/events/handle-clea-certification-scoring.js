const { checkEventTypes } = require('./check-event-types');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');

const eventType = CertificationScoringCompleted;

async function handleCleaCertificationScoring({
  event,
  partnerCertificationScoringRepository,
}) {
  checkEventTypes(event, [eventType]);
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
