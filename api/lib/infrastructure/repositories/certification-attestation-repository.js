const _ = require('lodash');
const { knex } = require('../../../db/knex-database-connection');
const CertificationAttestation = require('../../domain/models/CertificationAttestation');
const CleaCertificationResult = require('../../../lib/domain/models/CleaCertificationResult');
const { badgeKey: pixPlusDroitExpertBadgeKey } = require('../../../lib/domain/models/PixPlusDroitExpertCertificationResult');
const { badgeKey: pixPlusDroitMaitreBadgeKey } = require('../../../lib/domain/models/PixPlusDroitMaitreCertificationResult');
const AssessmentResult = require('../../domain/models/AssessmentResult');
const { NotFoundError } = require('../../../lib/domain/errors');
const competenceTreeRepository = require('./competence-tree-repository');
const ResultCompetenceTree = require('../../domain/models/ResultCompetenceTree');
const CompetenceMark = require('../../domain/models/CompetenceMark');

const macaronCleaPath = `${__dirname}/../utils/pdf/files/macaron_clea.png`;
const macaronPixPlusDroitMaitrePath = `${__dirname}/../utils/pdf/files/macaron_maitre.png`;
const macaronPixPlusDroitExpertPath = `${__dirname}/../utils/pdf/files/macaron_expert.png`;

module.exports = {
  macaronCleaPath,
  macaronPixPlusDroitMaitrePath,
  macaronPixPlusDroitExpertPath,

  async get(id) {
    const certificationCourseDTO = await _selectCertificationAttestations()
      .where('certification-courses.id', '=', id)
      .groupBy('certification-courses.id', 'sessions.id', 'assessments.id', 'assessment-results.id')
      .first();

    if (!certificationCourseDTO) {
      throw new NotFoundError(`There is no certification course with id "${id}"`);
    }

    const competenceTree = await competenceTreeRepository.get();

    const cleaCertificationImagePath = await _getCleaCertificationImagePath(certificationCourseDTO.id);
    const pixPlusDroitCertificationImagePath = await _getPixPlusDroitCertificationImagePath(certificationCourseDTO.id);

    return _toDomain(certificationCourseDTO, competenceTree, cleaCertificationImagePath, pixPlusDroitCertificationImagePath);
  },

  async findByDivisionForScoIsManagingStudentsOrganization({ organizationId, division }) {
    const certificationCourseDTOs = await _selectCertificationAttestations()
      .select({ schoolingRegistrationId: 'schooling-registrations.id' })
      .innerJoin('certification-candidates', function() {
        this.on({ 'certification-candidates.sessionId': 'certification-courses.sessionId' })
          .andOn({ 'certification-candidates.userId': 'certification-courses.userId' });
      })
      .innerJoin('schooling-registrations', 'schooling-registrations.id', 'certification-candidates.schoolingRegistrationId')
      .innerJoin('organizations', 'organizations.id', 'schooling-registrations.organizationId')
      .where('schooling-registrations.organizationId', '=', organizationId)
      .whereRaw('LOWER("schooling-registrations"."division") = ?', division.toLowerCase())
      .whereRaw('"certification-candidates"."userId" = "certification-courses"."userId"')
      .whereRaw('"certification-candidates"."sessionId" = "certification-courses"."sessionId"')
      .modify(_checkOrganizationIsScoIsManagingStudents)
      .groupBy('schooling-registrations.id', 'certification-courses.id', 'sessions.id', 'assessments.id', 'assessment-results.id')
      .orderBy('certification-courses.createdAt', 'DESC');

    const competenceTree = await competenceTreeRepository.get();

    const mostRecentCertificationsPerSchoolingRegistration = _filterMostRecentCertificationCoursePerSchoolingRegistration(certificationCourseDTOs);
    return _(mostRecentCertificationsPerSchoolingRegistration)
      .orderBy(['lastName', 'firstName'], ['asc', 'asc'])
      .map((certificationCourseDTO) => {
        return _toDomain(certificationCourseDTO, competenceTree, null, null);
      })
      .value();
  },
};

function _selectCertificationAttestations() {
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
      verificationCode: 'certification-courses.verificationCode',
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

function _checkOrganizationIsScoIsManagingStudents(qb) {
  return qb
    .where('organizations.type', 'SCO')
    .where('organizations.isManagingStudents', true);
}

function _filterMostRecentCertificationCoursePerSchoolingRegistration(DTOs) {
  const groupedBySchoolingRegistration = _.groupBy(DTOs, 'schoolingRegistrationId');

  const mostRecent = [];
  for (const certificationsForOneSchoolingRegistration of Object.values(groupedBySchoolingRegistration)) {
    mostRecent.push(certificationsForOneSchoolingRegistration[0]);
  }
  return mostRecent;
}

async function _getCleaCertificationImagePath(certificationCourseId) {
  const result = await knex
    .select('partnerKey')
    .from('partner-certifications')
    .where({ certificationCourseId, partnerKey: CleaCertificationResult.badgeKey, acquired: true })
    .first();

  if (!result) return null;
  return macaronCleaPath;
}

async function _getPixPlusDroitCertificationImagePath(certificationCourseId) {
  const handledBadgeKeys = [pixPlusDroitExpertBadgeKey, pixPlusDroitMaitreBadgeKey];
  const result = await knex
    .select('partnerKey')
    .from('partner-certifications')
    .where({ certificationCourseId, acquired: true })
    .whereIn('partnerKey', handledBadgeKeys)
    .first();

  if (!result) return null;
  if (result.partnerKey === pixPlusDroitMaitreBadgeKey) return macaronPixPlusDroitMaitrePath;
  if (result.partnerKey === pixPlusDroitExpertBadgeKey) return macaronPixPlusDroitExpertPath;
}

function _toDomain(certificationCourseDTO, competenceTree, cleaCertificationImagePath, pixPlusDroitCertificationImagePath) {

  const competenceResults = JSON .parse(certificationCourseDTO.competenceResultsJson);

  const competenceMarks = competenceResults.map((competenceMark) => new CompetenceMark({
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

  return new CertificationAttestation({
    ...certificationCourseDTO,
    resultCompetenceTree,
    cleaCertificationImagePath,
    pixPlusDroitCertificationImagePath,
  });
}
