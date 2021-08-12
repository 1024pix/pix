const _ = require('lodash');
const { knex } = require('../../../db/knex-database-connection');
const PrivateCertificate = require('../../domain/models/PrivateCertificate');
const CleaCertificationResult = require('../../../lib/domain/models/CleaCertificationResult');
const { badgeKey: pixPlusDroitExpertBadgeKey } = require('../../../lib/domain/models/PixPlusDroitExpertCertificationResult');
const { badgeKey: pixPlusDroitMaitreBadgeKey } = require('../../../lib/domain/models/PixPlusDroitMaitreCertificationResult');
const { NotFoundError } = require('../../../lib/domain/errors');
const competenceTreeRepository = require('./competence-tree-repository');
const ResultCompetenceTree = require('../../domain/models/ResultCompetenceTree');
const CompetenceMark = require('../../domain/models/CompetenceMark');

module.exports = {

  async get(id) {
    const certificationCourseDTO = await _selectPrivateCertificates()
      .where('certification-courses.id', '=', id)
      .groupBy('certification-courses.id', 'sessions.id', 'assessments.id', 'assessment-results.id')
      .first();

    if (!certificationCourseDTO) {
      throw new NotFoundError(`Certificate not found for ID ${id}`);
    }

    const cleaCertificationResult = await _getCleaCertificationResult(id);
    const certifiedBadgeImages = await _getCertifiedBadgeImages(id);

    const competenceTree = await competenceTreeRepository.get();

    return _toDomain({
      certificationCourseDTO,
      competenceTree,
      cleaCertificationResult,
      certifiedBadgeImages,
    });
  },

  async findByUserId({ userId }) {
    const certificationCourseDTOs = await _selectPrivateCertificates()
      .where('certification-courses.userId', '=', userId)
      .groupBy('certification-courses.id', 'sessions.id', 'assessments.id', 'assessment-results.id')
      .orderBy('certification-courses.createdAt', 'DESC');

    const privateCertificates = [];
    for (const certificationCourseDTO of certificationCourseDTOs) {
      const cleaCertificationResult = await _getCleaCertificationResult(certificationCourseDTO.id);
      const certifiedBadgeImages = await _getCertifiedBadgeImages(certificationCourseDTO.id);
      const privateCertificate = _toDomain({
        certificationCourseDTO,
        cleaCertificationResult,
        certifiedBadgeImages,
      });
      privateCertificates.push(privateCertificate);
    }
    return privateCertificates;
  },
};

function _selectPrivateCertificates() {
  return knex
    .select({
      id: 'certification-courses.id',
      firstName: 'certification-courses.firstName',
      lastName: 'certification-courses.lastName',
      birthdate: 'certification-courses.birthdate',
      birthplace: 'certification-courses.birthplace',
      isPublished: 'certification-courses.isPublished',
      isCancelled: 'certification-courses.isCancelled',
      userId: 'certification-courses.userId',
      date: 'certification-courses.createdAt',
      verificationCode: 'certification-courses.verificationCode',
      deliveredAt: 'sessions.publishedAt',
      certificationCenter: 'sessions.certificationCenter',
      maxReachableLevelOnCertificationDate: 'certification-courses.maxReachableLevelOnCertificationDate',
      pixScore: 'assessment-results.pixScore',
      commentForCandidate: 'assessment-results.commentForCandidate',
      assessmentResultStatus: 'assessment-results.status',
      assessmentResultId: 'assessment-results.id',
    })
    .select(knex.raw('\'[\' || (string_agg(\'{ "score":\' || "competence-marks".score::VARCHAR || \', "level":\' || "competence-marks".level::VARCHAR || \', "competenceId":"\' || "competence-marks"."competence_code" || \'"}\', \',\')) || \']\' as "competenceResultsJson"'))
    .from('certification-courses')
    .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .leftJoin('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
    .modify(_filterMostRecentAssessmentResult)
    .leftJoin('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id')
    .join('sessions', 'sessions.id', 'certification-courses.sessionId');
}

function _filterMostRecentAssessmentResult(qb) {
  return qb
    .whereNotExists(
      knex.select(1)
        .from({ 'last-assessment-results': 'assessment-results' })
        .whereRaw('"last-assessment-results"."assessmentId" = assessments.id')
        .whereRaw('"assessment-results"."createdAt" < "last-assessment-results"."createdAt"'),
    );
}

async function _getCleaCertificationResult(certificationCourseId) {
  const result = await knex
    .select('acquired')
    .from('partner-certifications')
    .where({ certificationCourseId, partnerKey: CleaCertificationResult.badgeKey })
    .first();

  if (!result) {
    return CleaCertificationResult.buildNotTaken();
  }
  return CleaCertificationResult.buildFrom(result);
}

async function _getCertifiedBadgeImages(certificationCourseId) {
  const handledBadgeKeys = [pixPlusDroitExpertBadgeKey, pixPlusDroitMaitreBadgeKey];
  const results = await knex
    .select('partnerKey')
    .from('partner-certifications')
    .where({ certificationCourseId, acquired: true })
    .whereIn('partnerKey', handledBadgeKeys)
    .orderBy('partnerKey');

  return _.compact(_.map(results, (result) => {
    if (result.partnerKey === pixPlusDroitMaitreBadgeKey) return 'https://images.pix.fr/badges-certifies/pix-droit/maitre.svg';
    if (result.partnerKey === pixPlusDroitExpertBadgeKey) return 'https://images.pix.fr/badges-certifies/pix-droit/expert.svg';
    return null;
  }));
}

function _toDomain({ certificationCourseDTO, competenceTree, cleaCertificationResult, certifiedBadgeImages }) {

  if (competenceTree) {

    const competenceResults = JSON .parse(certificationCourseDTO.competenceResultsJson);

    const competenceMarks = _.map(competenceResults, (competenceMark) => new CompetenceMark({
      score: competenceMark.score,
      level: competenceMark.level,
      competence_code: competenceMark.competenceId,
    }));

    const resultCompetenceTree = ResultCompetenceTree.generateTreeFromCompetenceMarks({
      competenceTree,
      competenceMarks,
      certificationId: certificationCourseDTO.id,
      assessmentResultId: certificationCourseDTO.assessmentResultId,
    });

    return PrivateCertificate.buildFrom({
      ...certificationCourseDTO,
      resultCompetenceTree,
      cleaCertificationResult,
      certifiedBadgeImages,
    });
  }

  return PrivateCertificate.buildFrom({
    ...certificationCourseDTO,
    cleaCertificationResult,
    certifiedBadgeImages,
  });
}
