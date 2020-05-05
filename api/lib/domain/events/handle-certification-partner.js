const Badge = require('../models/Badge');
const CertificationPartnerAcquisition = require('../models/CertificationPartnerAcquisition');

async function handleCertificationAcquisitionForPartner({
  certificationScoringEvent,
  domainTransaction,
  badgeAcquisitionRepository,
  competenceRepository,
  certificationPartnerAcquisitionRepository,
}) {
  const hasAcquiredBadgeClea = await _getHasAcquiredBadgeClea(badgeAcquisitionRepository, certificationScoringEvent.userId);

  const cleaPartnerAcquisition = new CertificationPartnerAcquisition({
    certificationCourseId: certificationScoringEvent.certificationCourseId,
    partnerKey: Badge.keys.PIX_EMPLOI_CLEA,
  });

  const pixScoreByCompetence = await competenceRepository.getPixScoreByCompetence({
    userId: certificationScoringEvent.userId,
    limitDate: certificationScoringEvent.limitDate,
  });

  const totalPixCleaByCompetence = await competenceRepository.getTotalPixCleaByCompetence();

  if (cleaPartnerAcquisition.hasAcquiredCertification({
    hasAcquiredBadge: hasAcquiredBadgeClea,
    reproducibilityRate: certificationScoringEvent.reproducibilityRate,
    totalPixCleaByCompetence,
    pixScoreByCompetence
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
