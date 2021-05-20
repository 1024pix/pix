const CertificationRescoringCompleted = require('./CertificationRescoringCompleted');
const { checkEventTypes } = require('./check-event-types');

const eventTypes = [ CertificationRescoringCompleted ];

async function handleCleaCertificationRescoring({
  event,
  cleaCertificationResultRepository,
  partnerCertificationScoringRepository,
}) {
  checkEventTypes(event, eventTypes);
  const { certificationCourseId } = event;
  const cleaCertificationResult = await cleaCertificationResultRepository.get({ certificationCourseId });
  if (!cleaCertificationResult.isTaken()) {
    return;
  }

  const cleaCertificationScoring = await partnerCertificationScoringRepository.buildCleaCertificationScoring({
    certificationCourseId,
    userId: event.userId,
    reproducibilityRate: event.reproducibilityRate,
  });

  await partnerCertificationScoringRepository.save({ partnerCertificationScoring: cleaCertificationScoring });
}

handleCleaCertificationRescoring.eventTypes = eventTypes;
module.exports = handleCleaCertificationRescoring;
