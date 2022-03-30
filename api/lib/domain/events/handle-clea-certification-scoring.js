const { checkEventTypes } = require('./check-event-types');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');
const CertificationRescoringCompleted = require('./CertificationRescoringCompleted');
const { CLEA } = require('../models/ComplementaryCertification');

const eventTypes = [CertificationScoringCompleted, CertificationRescoringCompleted];

async function handleCleaCertificationScoring({
  event,
  partnerCertificationScoringRepository,
  complementaryCertificationCourseRepository,
}) {
  checkEventTypes(event, eventTypes);
  const { certificationCourseId, userId, reproducibilityRate } = event;
  const complementaryCertificationCourseId =
    await complementaryCertificationCourseRepository.getComplementaryCertificationCourseId({
      certificationCourseId,
      complementaryCertificationName: CLEA,
    });
  if (!complementaryCertificationCourseId) {
    return;
  }

  const cleaCertificationScoring = await partnerCertificationScoringRepository.buildCleaCertificationScoring({
    complementaryCertificationCourseId,
    certificationCourseId,
    userId,
    reproducibilityRate,
  });

  return partnerCertificationScoringRepository.save({ partnerCertificationScoring: cleaCertificationScoring });
}

handleCleaCertificationScoring.eventTypes = eventTypes;
module.exports = handleCleaCertificationScoring;
