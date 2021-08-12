const _ = require('lodash');
const { knex } = require('../../../db/knex-database-connection');
const ShareableCertificate = require('../../domain/models/ShareableCertificate');
const AssessmentResult = require('../../domain/models/AssessmentResult');
const CleaCertificationResult = require('../../../lib/domain/models/CleaCertificationResult');
const { badgeKey: pixPlusDroitExpertBadgeKey } = require('../../../lib/domain/models/PixPlusDroitExpertCertificationResult');
const { badgeKey: pixPlusDroitMaitreBadgeKey } = require('../../../lib/domain/models/PixPlusDroitMaitreCertificationResult');
const { NotFoundError } = require('../../../lib/domain/errors');
const competenceTreeRepository = require('./competence-tree-repository');
const ResultCompetenceTree = require('../../domain/models/ResultCompetenceTree');
const CompetenceMark = require('../../domain/models/CompetenceMark');

module.exports = {

  async getByVerificationCode(verificationCode) {
    const shareableCertificateDTO = await _selectShareableCertificates()
      .groupBy('certification-courses.id', 'sessions.id', 'assessments.id', 'assessment-results.id')
      .where({ verificationCode })
      .first();

    if (!shareableCertificateDTO) {
      throw new NotFoundError(`There is no certification course with verification code "${verificationCode}"`);
    }

    const competenceTree = await competenceTreeRepository.get();

    const cleaCertificationResult = await _getCleaCertificationResult(shareableCertificateDTO.id);
    const certifiedBadgeImages = await _getCertifiedBadgeImages(shareableCertificateDTO.id);

    return _toDomain(shareableCertificateDTO, competenceTree, cleaCertificationResult, certifiedBadgeImages);
  },
};

function _selectShareableCertificates() {
  return knex
    .select({
      id: 'certification-courses.id',
      firstName: 'certification-courses.firstName',
      lastName: 'certification-courses.lastName',
      birthdate: 'certification-courses.birthdate',
      birthplace: 'certification-courses.birthplace',
      isPublished: 'certification-courses.isPublished',
      userId: 'certification-courses.userId',
      date: 'certification-courses.createdAt',
      deliveredAt: 'sessions.publishedAt',
      certificationCenter: 'sessions.certificationCenter',
      maxReachableLevelOnCertificationDate: 'certification-courses.maxReachableLevelOnCertificationDate',
      pixScore: 'assessment-results.pixScore',
      assessmentResultId: 'assessment-results.id',
    })
    .select(knex.raw('\'[\' || (string_agg(\'{ "score":\' || "competence-marks".score::VARCHAR || \', "level":\' || "competence-marks".level::VARCHAR || \', "competenceId":"\' || "competence-marks"."competence_code" || \'"}\', \',\')) || \']\' as "competenceResultsJson"'))
    .from('certification-courses')
    .join('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .join('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
    .join('competence-marks', 'competence-marks.assessmentResultId', 'assessment-results.id')
    .join('sessions', 'sessions.id', 'certification-courses.sessionId')
    .modify(_filterMostRecentValidatedAssessmentResult)
    .where('certification-courses.isPublished', true)
    .where('certification-courses.isCancelled', false);
}

function _filterMostRecentValidatedAssessmentResult(qb) {
  return qb
    .whereNotExists(
      knex.select(1)
        .from({ 'last-assessment-results': 'assessment-results' })
        .where('last-assessment-results.status', AssessmentResult.status.VALIDATED)
        .whereRaw('"last-assessment-results"."assessmentId" = assessments.id')
        .whereRaw('"assessment-results"."createdAt" < "last-assessment-results"."createdAt"'),
    )
    .where('assessment-results.status', AssessmentResult.status.VALIDATED);
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

function _toDomain(shareableCertificateDTO, competenceTree, cleaCertificationResult, certifiedBadgeImages) {

  const competenceResults = JSON .parse(shareableCertificateDTO.competenceResultsJson);

  const competenceMarks = competenceResults.map((competenceMark) => new CompetenceMark({
    score: competenceMark.score,
    level: competenceMark.level,
    competence_code: competenceMark.competenceId,
  }));

  const resultCompetenceTree = ResultCompetenceTree.generateTreeFromCompetenceMarks({
    competenceTree,
    competenceMarks,
    certificationId: shareableCertificateDTO.id,
    assessmentResultId: shareableCertificateDTO.assessmentResultId,
  });

  return new ShareableCertificate({
    ...shareableCertificateDTO,
    resultCompetenceTree,
    cleaCertificationResult,
    certifiedBadgeImages,
  });
}
