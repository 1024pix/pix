const { checkEventTypes } = require('./check-event-types');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');
const { CLEA } = require('../models/ComplementaryCertification');

const eventTypes = [CertificationScoringCompleted];

async function handleCleaCertificationScoring({
  event,
  partnerCertificationScoringRepository,
  badgeRepository,
  certificationCourseRepository,
  complementaryCertificationCourseRepository,
  knowledgeElementRepository,
  targetProfileRepository,
  badgeCriteriaService,
}) {
  checkEventTypes(event, eventTypes);
  const { certificationCourseId, userId, reproducibilityRate } = event;

  const hasRunCleA = await complementaryCertificationCourseRepository.hasComplementaryCertification({
    certificationCourseId,
    complementaryCertificationName: CLEA,
  });
  if (!hasRunCleA) {
    return;
  }

  const cleaCertificationScoring = await partnerCertificationScoringRepository.buildCleaCertificationScoring({
    certificationCourseId,
    userId,
    reproducibilityRate,
  });

  if (cleaCertificationScoring.hasAcquiredBadge) {
    await _verifyBadgeValidity(
      certificationCourseRepository,
      event,
      badgeRepository,
      cleaCertificationScoring,
      targetProfileRepository,
      knowledgeElementRepository,
      badgeCriteriaService
    );
  }

  if (cleaCertificationScoring.isEligible()) {
    await partnerCertificationScoringRepository.save({ partnerCertificationScoring: cleaCertificationScoring });
  }
}

async function _verifyBadgeValidity(
  certificationCourseRepository,
  event,
  badgeRepository,
  cleaCertificationScoring,
  targetProfileRepository,
  knowledgeElementRepository,
  badgeCriteriaService
) {
  const beginningCertificationDate = await certificationCourseRepository.getCreationDate(event.certificationCourseId);

  const badge = await badgeRepository.getByKey(cleaCertificationScoring.partnerKey);
  const targetProfile = await targetProfileRepository.get(badge.targetProfileId);

  const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({
    userId: event.userId,
    limitDate: beginningCertificationDate,
  });

  cleaCertificationScoring.setBadgeAcquisitionStillValid(
    badgeCriteriaService.areBadgeCriteriaFulfilled({
      knowledgeElements,
      targetProfile,
      badge,
    })
  );
}

handleCleaCertificationScoring.eventTypes = eventTypes;
module.exports = handleCleaCertificationScoring;
