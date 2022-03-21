const { knex } = require('../../../../db/knex-database-connection');
const { NotFoundError } = require('../../../domain/errors');
const SessionForAttendanceSheet = require('../../../domain/read-models/SessionForAttendanceSheet');
const CertificationCandidateForAttendanceSheet = require('../../../domain/read-models/CertificationCandidateForAttendanceSheet');

module.exports = {
  async getWithCertificationCandidates(idSession) {
    const results = await knex
      .select(
        'sessions.id',
        'sessions.date',
        'sessions.time',
        'sessions.address',
        'sessions.room',
        'sessions.examiner',
        'certification-centers.name as certificationCenterName',
        'certification-centers.type as certificationCenterType',
        'organizations.isManagingStudents'
      )
      .select({
        certificationCandidates: knex.raw(`
        json_agg(json_build_object(
        'firstName', "certification-candidates"."firstName",
        'lastName', "certification-candidates"."lastName",
        'birthdate', "certification-candidates"."birthdate",
        'externalId', "certification-candidates"."externalId",
        'extraTimePercentage', "certification-candidates"."extraTimePercentage",
        'division', "organization-learners".division)
        order by lower("certification-candidates"."lastName"), lower("certification-candidates"."firstName"))
        `),
      })
      .from('sessions')
      .join('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
      .leftJoin('organizations', 'organizations.externalId', 'certification-centers.externalId')
      .leftJoin('certification-candidates', 'certification-candidates.sessionId', 'sessions.id')
      .leftJoin('organization-learners', 'organization-learners.id', 'certification-candidates.organizationLearnerId')
      .groupBy('sessions.id', 'certification-centers.id', 'organizations.id')
      .where({ 'sessions.id': idSession })
      .first();

    if (!results) {
      throw new NotFoundError("La session n'existe pas");
    }

    return _toDomain(results);
  },
};

function _toDomain(results) {
  const toDomainCertificationCandidates = results.certificationCandidates.map((candidate) => {
    return new CertificationCandidateForAttendanceSheet({ ...candidate });
  });

  return new SessionForAttendanceSheet({
    ...results,
    isOrganizationManagingStudents: results.isManagingStudents,
    certificationCandidates: toDomainCertificationCandidates,
  });
}
