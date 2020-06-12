const _ = require('lodash');
const { knex } = require('../bookshelf');
const DomainTransaction = require('../DomainTransaction');
const skillRepository = require('./skill-repository');
const PartnerCertificationBookshelf = require('../data/partner-certification');
const CleaCertification = require('../../domain/models/CleaCertification');
const CompetenceMark = require('../../domain/models/CompetenceMark');
const Badge = require('../../domain/models/Badge');

module.exports = {

  async buildCleaCertification({ certificationCourseId, userId, reproducibilityRate, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const hasAcquiredBadge = await _hasAcquiredBadge(userId, domainTransaction);
    const cleaSkills = await _getCleaSkills();
    const pixCompetenceIds = _(cleaSkills).map((s) => s.competenceId).uniq().value();
    const maxReachablePixByCompetenceForClea = _.zipObject(pixCompetenceIds, pixCompetenceIds.map((id) => _getSumPixValue(cleaSkills, id)));
    const cleaCompetenceMarks = await _getCleaCompetenceMarks(certificationCourseId, pixCompetenceIds, domainTransaction);

    return new CleaCertification({
      certificationCourseId,
      hasAcquiredBadge,
      competenceMarks: cleaCompetenceMarks,
      maxReachablePixByCompetenceForClea,
      reproducibilityRate
    });
  },

  async save({ partnerCertification, domainTransaction = DomainTransaction.emptyTransaction() }) {
    return new PartnerCertificationBookshelf(_adaptModelToDB({
      ...partnerCertification,
      acquired: partnerCertification.isAcquired()
    })).save(null, { transacting: domainTransaction.knexTransaction });
  },
};

function _adaptModelToDB({ certificationCourseId, partnerKey, acquired }) {
  return { certificationCourseId, partnerKey, acquired };
}

async function _hasAcquiredBadge(userId, domainTransaction) {
  const badgeAcquisitionQuery = knex('badge-acquisitions')
    .innerJoin('badges', 'badges.id', 'badgeId')
    .where({ userId, key: Badge.keys.PIX_EMPLOI_CLEA })
    .first();
  if (domainTransaction.knexTransaction) {
    badgeAcquisitionQuery.transacting(domainTransaction.knexTransaction);
  }
  const badgeAcquisition = await badgeAcquisitionQuery;
  return Boolean(badgeAcquisition);
}

async function _getCleaCompetenceMarks(certificationCourseId, cleaCompetenceIds, domainTransaction) {
  const competenceMarksQuery = knex.with('rankedAssessmentResults',
    (qb) => {
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
  return queryBuilder.select('assessment-results.id')
    .from('assessments')
    .join('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
    .where('assessments.certificationCourseId', '=', certificationCourseId)
    .orderBy('assessment-results.createdAt', 'DESC')
    .limit(1);
}

async function _getCleaSkills() {
  const skillIds = await knex('badge-partner-competences')
    .select('skillIds')
    .join('badges', 'badges.id', 'badge-partner-competences.badgeId')
    .where('badges.key', '=', Badge.keys.PIX_EMPLOI_CLEA);

  if (_.isEmpty(skillIds)) {
    return [];
  }
  return skillRepository.findByIds(skillIds[0].skillIds);
}

function _getSumPixValue(cleaSkills, id) {
  return _(cleaSkills)
    .filter((skill) => skill.competenceId === id)
    .reduce((cumulatedPixValue, skill) => cumulatedPixValue + skill.pixValue, 0);
}
