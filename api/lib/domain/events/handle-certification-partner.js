const Badge = require('../models/Badge');
const CertificationPartnerAcquisition = require('../models/CertificationPartnerAcquisition');

async function handleCertificationAcquisitionForPartner({
  certificationScoringEvent,
  domainTransaction,
  badgeAcquisitionRepository,
  competenceRepository,
  competenceMarkRepository,
  certificationPartnerAcquisitionRepository,
}) {
  const certificationCourseId = certificationScoringEvent.certificationCourseId;
  const cleaPartnerAcquisition = new CertificationPartnerAcquisition({
    certificationCourseId,
    partnerKey: Badge.keys.PIX_EMPLOI_CLEA,
  });

  const hasAcquiredBadgeClea = await _getHasAcquiredBadgeClea(badgeAcquisitionRepository, certificationScoringEvent.userId);
  const competenceMarks = await competenceMarkRepository.getLatestByCertificationCourseId({ certificationCourseId, domainTransaction });
  const totalPixCleaByCompetence = await competenceRepository.getTotalPixCleaByCompetence();

  if (cleaPartnerAcquisition.hasAcquiredCertification({
    hasAcquiredBadge: hasAcquiredBadgeClea,
    reproducibilityRate: certificationScoringEvent.reproducibilityRate,
    totalPixCleaByCompetence,
    competenceMarks
  })) {
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
