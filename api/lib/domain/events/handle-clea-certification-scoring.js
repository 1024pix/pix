const { checkEventTypes } = require('./check-event-types');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');

const eventTypes = [ CertificationScoringCompleted ];

async function handleCleaCertificationScoring({
  event,
  partnerCertificationScoringRepository,
}) {
  checkEventTypes(event, eventTypes);
  const cleaCertificationScoring = await partnerCertificationScoringRepository.buildCleaCertificationScoring({
    certificationCourseId: event.certificationCourseId,
    userId: event.userId,
    reproducibilityRate: event.reproducibilityRate,
  });

  if (cleaCertificationScoring.isEligible()) {
    await partnerCertificationScoringRepository.save({ partnerCertificationScoring: cleaCertificationScoring });
  }
}

handleCleaCertificationScoring.eventTypes = eventTypes;
module.exports = handleCleaCertificationScoring;
