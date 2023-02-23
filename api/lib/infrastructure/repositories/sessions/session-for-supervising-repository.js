const { knex } = require('../../../../db/knex-database-connection.js');
const { NotFoundError } = require('../../../domain/errors.js');
const CertificationCandidateForSupervising = require('../../../domain/models/CertificationCandidateForSupervising.js');
const SessionForSupervising = require('../../../domain/read-models/SessionForSupervising.js');

module.exports = {
  async get(idSession) {
    const results = await knex
      .select({
        id: 'sessions.id',
        date: 'sessions.date',
        time: 'sessions.time',
        room: 'sessions.room',
        examiner: 'sessions.examiner',
        accessCode: 'sessions.accessCode',
        certificationCenterName: 'certification-centers.name',
        certificationCandidates: knex.raw(`
          json_agg(json_build_object(
            'firstName', "certification-candidates"."firstName",
            'lastName', "certification-candidates"."lastName",
            'birthdate', "certification-candidates"."birthdate",
            'id', "certification-candidates"."id",
            'extraTimePercentage', "certification-candidates"."extraTimePercentage",
            'authorizedToStart', "certification-candidates"."authorizedToStart",
            'assessmentStatus', "assessments"."state",
            'startDateTime', "certification-courses"."createdAt"
          ) order by lower("certification-candidates"."lastName"), lower("certification-candidates"."firstName"))
      `),
      })
      .from('sessions')
      .leftJoin('certification-candidates', 'certification-candidates.sessionId', 'sessions.id')
      .leftJoin('certification-courses', function () {
        this.on('certification-courses.sessionId', '=', 'sessions.id');
        this.on('certification-courses.userId', '=', 'certification-candidates.userId');
      })
      .leftJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
      .innerJoin('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
      .groupBy('sessions.id', 'certification-centers.id')
      .where({ 'sessions.id': idSession })
      .first();
    if (!results) {
      throw new NotFoundError("La session n'existe pas");
    }
    return _toDomain(results);
  },
};

function _toDomain(results) {
  const certificationCandidates = results.certificationCandidates
    .filter((candidate) => candidate?.id !== null)
    .map((candidate) => new CertificationCandidateForSupervising({ ...candidate }));

  return new SessionForSupervising({
    ...results,
    certificationCandidates: certificationCandidates,
  });
}
