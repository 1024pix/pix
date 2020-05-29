const CertificationPartnerAcquisitionBookshelf = require('../data/certification-partner-acquisition');
const CertificationCleaAcquisition = require('../../domain/models/CertificationCleaAcquisition');
const competenceMarkRepository = require('./competence-mark-repository');
const badgeAcquisitionRepository = require('./badge-acquisition-repository');
const competenceRepository = require('./competence-repository');
const Badge = require('../../domain/models/Badge');

module.exports = {

  async buildCertificationCleaAcquisition({ certificationCourseId,  userId,  reproducibilityRate, domainTransaction, }) {
    const hasAcquiredBadgeClea = await _getHasAcquiredBadgeClea(userId);
    const competenceMarks = await competenceMarkRepository.getLatestByCertificationCourseId({ certificationCourseId,domainTransaction });
    const totalPixCleaByCompetence = await competenceRepository.getTotalPixCleaByCompetence();

    return CertificationCleaAcquisition.create({
      certificationCourseId,
      hasAcquiredBadgeClea,
      competenceMarks,
      totalPixCleaByCompetence,
      reproducibilityRate
    });
  },

  async save(certificationPartnerAcquisition, domainTransaction = {}) {
    return new CertificationPartnerAcquisitionBookshelf(_adaptModelToDB({
      ...certificationPartnerAcquisition,
      acquired: certificationPartnerAcquisition.isAcquired()
    })).save(null , { transacting: domainTransaction.knexTransaction });
  },
};

async function _getHasAcquiredBadgeClea(userId) {
  return badgeAcquisitionRepository.hasAcquiredBadgeWithKey({
    badgeKey: Badge.keys.PIX_EMPLOI_CLEA,
    userId,
  });
}

function _adaptModelToDB({ certificationCourseId, partnerKey, acquired }) {
  return { certificationCourseId, partnerKey, acquired };
}
