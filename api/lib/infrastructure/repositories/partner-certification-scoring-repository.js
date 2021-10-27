const _ = require('lodash');
const { knex } = require('../bookshelf');
const DomainTransaction = require('../DomainTransaction');
const PartnerCertificationBookshelf = require('../orm-models/PartnerCertification');
const CleaCertificationScoring = require('../../domain/models/CleaCertificationScoring');
const CompetenceMark = require('../../domain/models/CompetenceMark');
const Badge = require('../../domain/models/Badge');

module.exports = {
  async buildCleaCertificationScoring({
    certificationCourseId,
    userId,
    reproducibilityRate,
    domainTransaction = DomainTransaction.emptyTransaction(),
    skillRepository,
  }) {
    const cleaBadgeKey = await _getAcquiredCleaBadgeKey(userId, certificationCourseId, domainTransaction);
    const hasAcquiredBadge = Boolean(cleaBadgeKey);
    if (!hasAcquiredBadge) {
      return CleaCertificationScoring.buildNotEligible({ certificationCourseId });
    }
    const cleaSkills = await _getCleaSkills(cleaBadgeKey, skillRepository);
    const maxReachablePixByCompetenceForClea = _getMaxReachablePixByCompetenceForClea(cleaSkills);
    const cleaCompetenceMarks = await _getCleaCompetenceMarks({
      certificationCourseId,
      cleaCompetenceIds: Object.keys(maxReachablePixByCompetenceForClea),
      domainTransaction,
    });
    return new CleaCertificationScoring({
      certificationCourseId,
      hasAcquiredBadge,
      cleaCompetenceMarks,
      maxReachablePixByCompetenceForClea,
      reproducibilityRate,
      cleaBadgeKey,
    });
  },

  async save({ partnerCertificationScoring, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const partnerCertificationToSave = new PartnerCertificationBookshelf(
      _adaptModelToDB({
        ...partnerCertificationScoring,
        acquired: partnerCertificationScoring.isAcquired(),
      })
    );

    const exists = await knex
      .select('acquired')
      .from('partner-certifications')
      .where({
        certificationCourseId: partnerCertificationScoring.certificationCourseId,
        partnerKey: partnerCertificationScoring.partnerKey,
      })
      .first();

    if (exists) {
      return partnerCertificationToSave
        .where({
          certificationCourseId: partnerCertificationScoring.certificationCourseId,
          partnerKey: partnerCertificationScoring.partnerKey,
        })
        .save(null, { transacting: domainTransaction.knexTransaction, method: 'update' });
    }

    return partnerCertificationToSave.save(null, { transacting: domainTransaction.knexTransaction, method: 'insert' });
  },
};

function _adaptModelToDB({ certificationCourseId, partnerKey, acquired }) {
  return { certificationCourseId, partnerKey, acquired };
}

async function _getAcquiredCleaBadgeKey(userId, certificationCourseId, domainTransaction) {
  const badgeAcquisitionQuery = knex('badge-acquisitions')
    .pluck('badges.key')
    .innerJoin('badges', 'badges.id', 'badgeId')
    .innerJoin('certification-courses', 'certification-courses.userId', 'badge-acquisitions.userId')
    .where('badge-acquisitions.userId', userId)
    .whereIn('badges.key', [Badge.keys.PIX_EMPLOI_CLEA, Badge.keys.PIX_EMPLOI_CLEA_V2])
    .where('certification-courses.id', certificationCourseId)
    .where('badge-acquisitions.createdAt', '<', knex.ref('certification-courses.createdAt'))
    .orderBy('badge-acquisitions.createdAt', 'DESC');
  if (domainTransaction.knexTransaction) {
    badgeAcquisitionQuery.transacting(domainTransaction.knexTransaction);
  }
  const [acquiredBadgeKey] = await badgeAcquisitionQuery;
  return acquiredBadgeKey;
}

async function _getCleaCompetenceMarks({ certificationCourseId, cleaCompetenceIds, domainTransaction }) {
  const competenceMarksQuery = knex
    .with('rankedAssessmentResults', (qb) => {
      _getLatestAssessmentResultIdByCertificationCourseIdQuery(qb, certificationCourseId);
    })
    .from('competence-marks')
    .select('competence-marks.*')
    .join('rankedAssessmentResults', 'rankedAssessmentResults.id', 'competence-marks.assessmentResultId')
    .whereIn('competenceId', cleaCompetenceIds);
  if (domainTransaction.knexTransaction) {
    competenceMarksQuery.transacting(domainTransaction.knexTransaction);
  }
  const competenceMarksRows = await competenceMarksQuery;
  return _.map(competenceMarksRows, (competenceMarksRow) => {
    return new CompetenceMark(competenceMarksRow);
  });
}

async function _getLatestAssessmentResultIdByCertificationCourseIdQuery(queryBuilder, certificationCourseId) {
  return queryBuilder
    .select('assessment-results.id')
    .from('assessments')
    .join('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
    .where('assessments.certificationCourseId', '=', certificationCourseId)
    .orderBy('assessment-results.createdAt', 'DESC')
    .limit(1);
}

async function _getCleaSkills(cleaBadgeKey, skillRepository) {
  const skillIdPacks = await knex('skill-sets')
    .select('skillIds')
    .join('badges', 'badges.id', 'skill-sets.badgeId')
    .where('badges.key', '=', cleaBadgeKey);

  const cleaSkillIds = _.flatMap(skillIdPacks, 'skillIds');
  return skillRepository.findOperativeByIds(cleaSkillIds);
}

function _getMaxReachablePixByCompetenceForClea(cleaSkills) {
  return _(cleaSkills)
    .groupBy('competenceId')
    .mapValues((skills) => _.sumBy(skills, 'pixValue'))
    .value();
}
