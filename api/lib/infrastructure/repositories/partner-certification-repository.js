const PartnerCertificationBookshelf = require('../data/partner-certification');
const CleaCertification = require('../../domain/models/CleaCertification');
const competenceMarkRepository = require('./competence-mark-repository');
const badgeAcquisitionRepository = require('./badge-acquisition-repository');
const competenceRepository = require('./competence-repository');
const Badge = require('../../domain/models/Badge');

module.exports = {

  async buildCleaCertification({ certificationCourseId,  userId,  reproducibilityRate, domainTransaction, }) {
    const hasAcquiredBadgeClea = await _getHasAcquiredBadgeClea(userId);
    const competenceMarks = await competenceMarkRepository.getLatestByCertificationCourseId({ certificationCourseId,domainTransaction });
    const totalPixCleaByCompetence = await competenceRepository.getTotalPixCleaByCompetence();

    return CleaCertification.create({
      certificationCourseId,
      hasAcquiredBadgeClea,
      competenceMarks,
      totalPixCleaByCompetence,
      reproducibilityRate
    });
  },

  async save(partnerCertification, domainTransaction = {}) {
    return new PartnerCertificationBookshelf(_adaptModelToDB({
      ...partnerCertification,
      acquired: partnerCertification.isAcquired()
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
