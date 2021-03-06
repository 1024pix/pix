const { checkEventTypes } = require('./check-event-types');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');

const eventTypes = [ CertificationScoringCompleted ];

async function handleCleaCertificationScoring({
  event,
  partnerCertificationScoringRepository,
  badgeRepository,
  certificationCourseRepository,
  knowledgeElementRepository,
  targetProfileRepository,
  badgeCriteriaService,
}) {
  checkEventTypes(event, eventTypes);
  const cleaCertificationScoring = await partnerCertificationScoringRepository.buildCleaCertificationScoring({
    certificationCourseId: event.certificationCourseId,
    userId: event.userId,
    reproducibilityRate: event.reproducibilityRate,
  });

  if (cleaCertificationScoring.hasAcquiredBadge) {
    await _verifyBadgeValidity(certificationCourseRepository, event, badgeRepository, cleaCertificationScoring, targetProfileRepository, knowledgeElementRepository, badgeCriteriaService);
  }

  if (cleaCertificationScoring.isEligible()) {
    await partnerCertificationScoringRepository.save({ partnerCertificationScoring: cleaCertificationScoring });
  }
}

async function _verifyBadgeValidity(certificationCourseRepository, event, badgeRepository, cleaCertificationScoring, targetProfileRepository, knowledgeElementRepository, badgeCriteriaService) {
  const beginningCertificationDate = await certificationCourseRepository.getCreationDate(event.certificationCourseId);

  const badge = await badgeRepository.getByKey(cleaCertificationScoring.partnerKey);
  const targetProfile = await targetProfileRepository.get(badge.targetProfileId);

  const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({
    userId: event.userId,
    limitDate: beginningCertificationDate,
  });

  cleaCertificationScoring.setBadgeAcquisitionStillValid(badgeCriteriaService.areBadgeCriteriaFulfilled({
    knowledgeElements,
    targetProfile,
    badge,
  }));
}

handleCleaCertificationScoring.eventTypes = eventTypes;
module.exports = handleCleaCertificationScoring;
