import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { SessionForAttendanceSheet } from '../../domain/read-models/SessionForAttendanceSheet.js';
import { CertificationCandidateForAttendanceSheet } from '../../domain/read-models/CertificationCandidateForAttendanceSheet.js';

const getWithCertificationCandidates = async function (sessionId) {
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
      'organizations.isManagingStudents',
    )
    .select({
      certificationCandidates: knex.raw(`
      json_agg(json_build_object(
      'firstName', "certification-candidates"."firstName",
      'lastName', "certification-candidates"."lastName",
      'birthdate', "certification-candidates"."birthdate",
      'externalId', "certification-candidates"."externalId",
      'extraTimePercentage', "certification-candidates"."extraTimePercentage",
      'division', "view-active-organization-learners".division)
      order by lower("certification-candidates"."lastName"), lower("certification-candidates"."firstName"))
      `),
    })
    .from('sessions')
    .join('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
    .leftJoin('organizations', function () {
      this.on('organizations.externalId', 'certification-centers.externalId').andOn(
        'organizations.type',
        'certification-centers.type',
      );
    })
    .innerJoin('certification-candidates', 'certification-candidates.sessionId', 'sessions.id')
    .leftJoin(
      'view-active-organization-learners',
      'view-active-organization-learners.id',
      'certification-candidates.organizationLearnerId',
    )
    .groupBy('sessions.id', 'certification-centers.id', 'organizations.id')
    .where({ 'sessions.id': sessionId })
    .first();

  if (!results) {
    throw new NotFoundError("La session n'existe pas ou aucun candidat n'est inscrit à celle-ci");
  }

  return _toDomain(results);
};

export { getWithCertificationCandidates };

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
