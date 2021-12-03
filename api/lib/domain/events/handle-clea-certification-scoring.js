const { checkEventTypes } = require('./check-event-types');
const CertificationScoringCompleted = require('./CertificationScoringCompleted');
const CertificationRescoringCompleted = require('./CertificationRescoringCompleted');
const { featureToggles } = require('../../config');
const { CLEA } = require('../models/ComplementaryCertification');

const eventTypes = [CertificationScoringCompleted, CertificationRescoringCompleted];

async function handleCleaCertificationScoring({
  event,
  partnerCertificationScoringRepository,
  badgeRepository,
  certificationCourseRepository,
  cleaCertificationResultRepository,
  certificationCenterRepository,
  knowledgeElementRepository,
  targetProfileRepository,
  badgeCriteriaService,
  complementaryCertificationCourseRepository,
}) {
  checkEventTypes(event, eventTypes);
  const { certificationCourseId, userId, reproducibilityRate } = event;

  if (featureToggles.isComplementaryCertificationSubscriptionEnabled) {
    return _handleScoringAndRescoringWithToggleEnabled(
      complementaryCertificationCourseRepository,
      certificationCourseId,
      partnerCertificationScoringRepository,
      userId,
      reproducibilityRate
    );
  }

  const certificationCenter = await certificationCenterRepository.getByCertificationCourseId(certificationCourseId);
  if (!certificationCenter.isHabilitatedClea) {
    return;
  }

  if (event instanceof CertificationRescoringCompleted) {
    return _handleRescoringWithToggleDisabled(
      event,
      certificationCenterRepository,
      cleaCertificationResultRepository,
      partnerCertificationScoringRepository
    );
  }

  await _handleScoringWithToggleDisabled(
    partnerCertificationScoringRepository,
    certificationCourseId,
    userId,
    reproducibilityRate,
    certificationCourseRepository,
    event,
    badgeRepository,
    targetProfileRepository,
    knowledgeElementRepository,
    badgeCriteriaService
  );
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

async function _handleScoringAndRescoringWithToggleEnabled(
  complementaryCertificationCourseRepository,
  certificationCourseId,
  partnerCertificationScoringRepository,
  userId,
  reproducibilityRate
) {
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

  return partnerCertificationScoringRepository.save({ partnerCertificationScoring: cleaCertificationScoring });
}

async function _handleRescoringWithToggleDisabled(
  event,
  certificationCenterRepository,
  cleaCertificationResultRepository,
  partnerCertificationScoringRepository
) {
  const { certificationCourseId } = event;

  const certificationCenter = await certificationCenterRepository.getByCertificationCourseId(certificationCourseId);
  if (!certificationCenter.isHabilitatedClea) {
    return;
  }
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

  return;
}

async function _handleScoringWithToggleDisabled(
  partnerCertificationScoringRepository,
  certificationCourseId,
  userId,
  reproducibilityRate,
  certificationCourseRepository,
  event,
  badgeRepository,
  targetProfileRepository,
  knowledgeElementRepository,
  badgeCriteriaService
) {
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

handleCleaCertificationScoring.eventTypes = eventTypes;
module.exports = handleCleaCertificationScoring;
