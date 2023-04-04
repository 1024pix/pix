const _ = require('lodash');

const { knex } = require('../../../../db/knex-database-connection.js');
const { NotFoundError } = require('../../../domain/errors.js');
const Session = require('../../../domain/models/Session.js');
const CertificationCenter = require('../../../domain/models/CertificationCenter.js');
const CertificationCandidate = require('../../../domain/models/CertificationCandidate.js');
const ComplementaryCertification = require('../../../domain/models/ComplementaryCertification.js');
const DomainTransaction = require('../../DomainTransaction.js');

module.exports = {
  async save(sessionData, { knexTransaction } = DomainTransaction.emptyTransaction()) {
    const knexConn = knexTransaction ?? knex;
    sessionData = _.omit(sessionData, ['certificationCandidates']);
    const [savedSession] = await knexConn('sessions').insert(sessionData).returning('*');

    return new Session(savedSession);
  },

  async saveSessions(sessionsData) {
    const sessions = sessionsData.map((session) => {
      return _.omit(session, ['certificationCandidates']);
    });
    return knex.batchInsert('sessions', sessions);
  },

  async isFinalized(id) {
    const session = await knex.select('id').from('sessions').where({ id }).whereNotNull('finalizedAt').first();
    return Boolean(session);
  },

  async get(sessionId) {
    const foundSession = await knex.select('*').from('sessions').where({ id: sessionId }).first();
    if (!foundSession) {
      throw new NotFoundError("La session n'existe pas ou son accès est restreint");
    }
    return new Session({ ...foundSession });
  },

  async isSessionExisting({ address, room, date, time }) {
    const sessions = await knex('sessions').where({ address, room, date, time });
    return sessions.length > 0;
  },

  async isSessionExistingBySessionAndCertificationCenterIds({ sessionId, certificationCenterId }) {
    const [session] = await knex('sessions').where({ id: sessionId, certificationCenterId });
    return Boolean(session);
  },

  async getWithCertificationCandidates(sessionId) {
    const session = await knex.from('sessions').where({ 'sessions.id': sessionId }).first();

    if (!session) {
      throw new NotFoundError("La session n'existe pas ou son accès est restreint");
    }

    const certificationCandidates = await knex
      .select('certification-candidates.*')
      .select({
        complementaryCertifications: knex.raw(`
        json_agg(json_build_object('id', "complementary-certifications"."id", 'label', "complementary-certifications"."label", 'key', "complementary-certifications"."key"))
        `),
      })
      .from('certification-candidates')
      .leftJoin(
        'complementary-certification-subscriptions',
        'complementary-certification-subscriptions.certificationCandidateId',
        'certification-candidates.id'
      )
      .leftJoin(
        'complementary-certifications',
        'complementary-certifications.id',
        'complementary-certification-subscriptions.complementaryCertificationId'
      )
      .groupBy('certification-candidates.id')
      .where({ sessionId })
      .orderByRaw('LOWER(??) ASC, LOWER(??) ASC', ['lastName', 'firstName']);

    return _toDomain({ ...session, certificationCandidates });
  },

  async updateSessionInfo(session) {
    const sessionDataToUpdate = _.pick(session, [
      'address',
      'room',
      'accessCode',
      'examiner',
      'date',
      'time',
      'description',
    ]);

    const [updatedSession] = await knex('sessions')
      .where({ id: session.id })
      .update(sessionDataToUpdate)
      .returning('*');
    return new Session(updatedSession);
  },

  async doesUserHaveCertificationCenterMembershipForSession(userId, sessionId) {
    const sessions = await knex
      .select('sessions.id')
      .from('sessions')
      .where({
        'sessions.id': sessionId,
        'certification-center-memberships.userId': userId,
        'certification-center-memberships.disabledAt': null,
      })
      .innerJoin('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
      .innerJoin(
        'certification-center-memberships',
        'certification-center-memberships.certificationCenterId',
        'certification-centers.id'
      );
    return Boolean(sessions.length);
  },

  async finalize({ id, examinerGlobalComment, hasIncident, hasJoiningIssue, finalizedAt }) {
    const [finalizedSession] = await knex('sessions')
      .where({ id })
      .update({ examinerGlobalComment, hasIncident, hasJoiningIssue, finalizedAt })
      .returning('*');
    return new Session(finalizedSession);
  },

  async flagResultsAsSentToPrescriber({ id, resultsSentToPrescriberAt }) {
    const [flaggedSession] = await knex('sessions').where({ id }).update({ resultsSentToPrescriberAt }).returning('*');
    return new Session(flaggedSession);
  },

  async updatePublishedAt({ id, publishedAt }) {
    const [publishedSession] = await knex('sessions').where({ id }).update({ publishedAt }).returning('*');
    return new Session(publishedSession);
  },

  async isSco({ sessionId }) {
    const result = await knex
      .select('certification-centers.type')
      .from('sessions')
      .where('sessions.id', '=', sessionId)
      .innerJoin('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
      .first();

    return result.type === CertificationCenter.types.SCO;
  },

  async delete(sessionId) {
    await knex.transaction(async (trx) => {
      const certificationCandidateIdsInSession = await knex('certification-candidates')
        .where({ sessionId })
        .pluck('id');
      const supervisorAccessIds = await knex('supervisor-accesses').where({ sessionId }).pluck('id');

      if (supervisorAccessIds) {
        await trx('supervisor-accesses').whereIn('id', supervisorAccessIds).del();
      }

      if (certificationCandidateIdsInSession.length) {
        await trx('complementary-certification-subscriptions')
          .whereIn('certificationCandidateId', certificationCandidateIdsInSession)
          .del();
        await trx('certification-candidates').whereIn('id', certificationCandidateIdsInSession).del();
      }
      const nbSessionsDeleted = await trx('sessions').where('id', sessionId).del();
      if (nbSessionsDeleted === 0) throw new NotFoundError();
    });

    return;
  },

  async hasSomeCleaAcquired(sessionId) {
    const result = await knex
      .select(1)
      .from('sessions')
      .innerJoin('certification-courses', 'certification-courses.sessionId', 'sessions.id')
      .innerJoin(
        'complementary-certification-courses',
        'complementary-certification-courses.certificationCourseId',
        'certification-courses.id'
      )
      .innerJoin(
        'complementary-certifications',
        'complementary-certifications.id',
        'complementary-certification-courses.complementaryCertificationId'
      )
      .innerJoin(
        'complementary-certification-course-results',
        'complementary-certification-course-results.complementaryCertificationCourseId',
        'complementary-certification-courses.id'
      )
      .where('sessions.id', sessionId)
      .whereNotNull('sessions.publishedAt')
      .where('complementary-certification-course-results.acquired', true)
      .where('complementary-certifications.key', ComplementaryCertification.CLEA)
      .first();
    return Boolean(result);
  },

  async hasNoStartedCertification(sessionId) {
    const result = await knex.select(1).from('certification-courses').where('sessionId', sessionId).first();
    return !result;
  },

  async countUncompletedCertifications(sessionId) {
    const { count } = await knex
      .count('id')
      .from('certification-courses')
      .where({ sessionId, completedAt: null })
      .first();
    return count;
  },
};

function _toDomain(results) {
  const toDomainCertificationCandidates = results.certificationCandidates
    .filter((candidateData) => candidateData != null)
    .map(
      (candidateData) =>
        new CertificationCandidate({
          ...candidateData,
          complementaryCertifications: candidateData.complementaryCertifications.filter(
            (complementaryCertification) => complementaryCertification.id != null
          ),
        })
    );

  return new Session({
    ...results,
    certificationCandidates: toDomainCertificationCandidates,
  });
}
