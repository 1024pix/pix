const { knex } = require('../../../db/knex-database-connection');
const { NotFoundError } = require('../../domain/errors');
const CertificationCandidateForSupervising = require('../../domain/models/CertificationCandidateForSupervising');
const SessionForSupervising = require('../../domain/read-models/SessionForSupervising');

module.exports = {
  async get(idSession) {
    const results = await knex
      .select({
        id: 'sessions.id',
        date: 'sessions.date',
        time: 'sessions.time',
        room: 'sessions.room',
        examiner: 'sessions.examiner',
        certificationCenterName: 'certification-centers.name',
        certificationCandidates: knex.raw(`
          json_agg("certification-candidates".* order by lower("lastName"), lower("firstName"))
      `),
      })
      .from('sessions')
      .leftJoin('certification-candidates', 'certification-candidates.sessionId', 'sessions.id')
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
    .filter((candidate) => candidate !== null)
    .map((candidate) => new CertificationCandidateForSupervising({ ...candidate }));

  return new SessionForSupervising({
    ...results,
    certificationCandidates: certificationCandidates,
  });
}
