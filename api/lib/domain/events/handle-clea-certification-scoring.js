const { checkEventTypes } = require('./check-event-types');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');

const eventTypes = [ CertificationScoringCompleted ];

async function handleCleaCertificationScoring({
  event,
  partnerCertificationScoringRepository,
  badgeRepository,
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
    const badge = await badgeRepository.getByKey(cleaCertificationScoring.partnerKey);
    const targetProfile = await targetProfileRepository.get(badge.targetProfileId);
    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({ userId: event.userId });
    cleaCertificationScoring.setBadgeStillAcquired(badgeCriteriaService.areBadgeCriteriaFulfilled({ knowledgeElements, targetProfile, badge }));
  }
  if (cleaCertificationScoring.isEligible()) {
    await partnerCertificationScoringRepository.save({ partnerCertificationScoring: cleaCertificationScoring });
  }
}

handleCleaCertificationScoring.eventTypes = eventTypes;
module.exports = handleCleaCertificationScoring;
