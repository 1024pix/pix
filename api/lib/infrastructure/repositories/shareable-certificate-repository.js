const _ = require('lodash');
const { knex } = require('../../../db/knex-database-connection');
const ShareableCertificate = require('../../domain/models/ShareableCertificate');
const AssessmentResult = require('../../domain/models/AssessmentResult');
const CleaCertificationResult = require('../../../lib/domain/models/CleaCertificationResult');
const CertifiedBadgeImage = require('../../../lib/domain/read-models/CertifiedBadgeImage');
const {
  PIX_EMPLOI_CLEA,
  PIX_EMPLOI_CLEA_V2,
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
} = require('../../domain/models/Badge').keys;
const { NotFoundError } = require('../../../lib/domain/errors');
const competenceTreeRepository = require('./competence-tree-repository');
const ResultCompetenceTree = require('../../domain/models/ResultCompetenceTree');

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
      competenceMarks: knex.raw(`
        json_agg(
          json_build_object('score', "competence-marks".score, 'level', "competence-marks".level, 'competence_code', "competence-marks"."competence_code")
          ORDER BY "competence-marks"."competence_code" asc
        )`),
    })
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
      knex
        .select(1)
        .from({ 'last-assessment-results': 'assessment-results' })
        .where('last-assessment-results.status', AssessmentResult.status.VALIDATED)
        .whereRaw('"last-assessment-results"."assessmentId" = assessments.id')
        .whereRaw('"assessment-results"."createdAt" < "last-assessment-results"."createdAt"')
    )
    .where('assessment-results.status', AssessmentResult.status.VALIDATED);
}

async function _getCleaCertificationResult(certificationCourseId) {
  const result = await knex
    .select('acquired')
    .from('complementary-certification-course-results')
    .where({ certificationCourseId })
    .whereIn('partnerKey', [PIX_EMPLOI_CLEA, PIX_EMPLOI_CLEA_V2])
    .first();

  if (!result) {
    return CleaCertificationResult.buildNotTaken();
  }
  return CleaCertificationResult.buildFrom(result);
}

async function _getCertifiedBadgeImages(certificationCourseId) {
  const handledBadgeKeys = [
    PIX_DROIT_EXPERT_CERTIF,
    PIX_DROIT_MAITRE_CERTIF,
    PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
    PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
    PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
    PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
    PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  ];
  const results = await knex
    .select('partnerKey', 'temporaryPartnerKey')
    .from('complementary-certification-course-results')
    .where({ certificationCourseId, acquired: true })
    .where(function () {
      this.whereIn('partnerKey', handledBadgeKeys).orWhereIn('temporaryPartnerKey', handledBadgeKeys);
    })
    .orderBy('partnerKey');
  return _.compact(
    _.map(results, ({ partnerKey, temporaryPartnerKey }) =>
      CertifiedBadgeImage.fromPartnerKey(partnerKey, temporaryPartnerKey)
    )
  );
}

function _toDomain(shareableCertificateDTO, competenceTree, cleaCertificationResult, certifiedBadgeImages) {
  const resultCompetenceTree = ResultCompetenceTree.generateTreeFromCompetenceMarks({
    competenceTree,
    competenceMarks: _.compact(shareableCertificateDTO.competenceMarks),
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
