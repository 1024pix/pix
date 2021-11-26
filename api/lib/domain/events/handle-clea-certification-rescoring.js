const CertificationRescoringCompleted = require('./CertificationRescoringCompleted');
const { checkEventTypes } = require('./check-event-types');
const { CLEA } = require('../models/ComplementaryCertification');

const eventTypes = [CertificationRescoringCompleted];

async function handleCleaCertificationRescoring({
  event,
  partnerCertificationScoringRepository,
  complementaryCertificationCourseRepository,
}) {
  checkEventTypes(event, eventTypes);
  const { certificationCourseId } = event;

  const hasRunCleA = await complementaryCertificationCourseRepository.hasComplementaryCertification({
    certificationCourseId,
    complementaryCertificationName: CLEA,
  });
  if (!hasRunCleA) {
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
