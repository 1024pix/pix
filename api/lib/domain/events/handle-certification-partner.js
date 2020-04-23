const Badge = require('../models/Badge');
const CertificationPartnerAcquisition = require('../models/CertificationPartnerAcquisition');

async function handleCertificationAcquisitionForPartner({
  certificationScoringEvent,
  domainTransaction,
  badgeAcquisitionRepository,
  certificationPartnerAcquisitionRepository,
}) {
  if (!certificationScoringEvent.isCertification) {
    return;
  }
  const hasAcquiredBadgeClea = await _getHasAcquiredBadgeClea(badgeAcquisitionRepository, certificationScoringEvent.userId);

  const cleaPartnerAcquisition = new CertificationPartnerAcquisition({
    certificationCourseId: certificationScoringEvent.certificationCourseId,
    partnerKey: Badge.keys.PIX_EMPLOI_CLEA,
  });

  if (cleaPartnerAcquisition.hasAcquiredCertification({ hasAcquiredBadge: hasAcquiredBadgeClea, percentageCorrectAnswers: certificationScoringEvent.percentageCorrectAnswers })) {
    await certificationPartnerAcquisitionRepository.save(cleaPartnerAcquisition, domainTransaction);
  }
}

async function _getHasAcquiredBadgeClea(badgeAcquisitionRepository, userId) {
  return badgeAcquisitionRepository.hasAcquiredBadgeWithKey({
    badgeKey: Badge.keys.PIX_EMPLOI_CLEA,
    userId,
  });
}

module.exports = handleCertificationAcquisitionForPartner;
