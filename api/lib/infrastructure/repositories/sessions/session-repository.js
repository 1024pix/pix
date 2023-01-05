const _ = require('lodash');

const { knex } = require('../../../../db/knex-database-connection');
const BookshelfSession = require('../../orm-models/Session');
const bookshelfToDomainConverter = require('../../utils/bookshelf-to-domain-converter');
const { NotFoundError } = require('../../../domain/errors');
const Session = require('../../../domain/models/Session');
const CertificationCenter = require('../../../domain/models/CertificationCenter');
const CertificationCandidate = require('../../../domain/models/CertificationCandidate');
const ComplementaryCertification = require('../../../domain/models/ComplementaryCertification');

module.exports = {
  async save(sessionData) {
    sessionData = _.omit(sessionData, ['certificationCandidates']);

    const [savedSession] = await knex('sessions').insert(sessionData).returning('*');

    return new Session(savedSession);
  },

  async saveSessions(sessionsData) {
    const sessions = sessionsData.map((session) => {
      return _.omit(session, ['certificationCandidates']);
    });

    const recordedSessions = await knex.batchInsert('sessions', sessions).returning('*');
    return recordedSessions.map((recordedSession) => new Session(recordedSession));
  },

  async isSessionCodeAvailable(accessCode) {
    const sessionWithAccessCode = await BookshelfSession.where({ accessCode }).fetch({ require: false });

    return !sessionWithAccessCode;
  },

  async isFinalized(id) {
    const session = await BookshelfSession.query((qb) => {
      qb.where({ id });
      qb.whereRaw('?? IS NOT NULL', ['finalizedAt']);
    }).fetch({ require: false, columns: 'id' });
    return Boolean(session);
  },

  async get(sessionId) {
    try {
      const session = await BookshelfSession.where({ id: sessionId }).fetch();
      return bookshelfToDomainConverter.buildDomainObject(BookshelfSession, session);
    } catch (err) {
      if (err instanceof BookshelfSession.NotFoundError) {
        throw new NotFoundError("La session n'existe pas ou son accès est restreint");
      }
      throw err;
    }
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

    let updatedSession = await new BookshelfSession({ id: session.id }).save(sessionDataToUpdate, {
      patch: true,
      method: 'update',
    });
    updatedSession = await updatedSession.refresh();
    return bookshelfToDomainConverter.buildDomainObject(BookshelfSession, updatedSession);
  },

  async doesUserHaveCertificationCenterMembershipForSession(userId, sessionId) {
    const session = await BookshelfSession.where({
      'sessions.id': sessionId,
      'certification-center-memberships.userId': userId,
      'certification-center-memberships.disabledAt': null,
    })
      .query((qb) => {
        qb.innerJoin('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId');
        qb.innerJoin(
          'certification-center-memberships',
          'certification-center-memberships.certificationCenterId',
          'certification-centers.id'
        );
      })
      .fetch({ require: false, columns: 'sessions.id' });
    return Boolean(session);
  },

  async finalize({ id, examinerGlobalComment, hasIncident, hasJoiningIssue, finalizedAt }) {
    let updatedSession = await new BookshelfSession({ id }).save(
      { examinerGlobalComment, hasIncident, hasJoiningIssue, finalizedAt },
      { patch: true }
    );
    updatedSession = await updatedSession.refresh();
    return bookshelfToDomainConverter.buildDomainObject(BookshelfSession, updatedSession);
  },

  async flagResultsAsSentToPrescriber({ id, resultsSentToPrescriberAt }) {
    let flaggedSession = await new BookshelfSession({ id }).save({ resultsSentToPrescriberAt }, { patch: true });
    flaggedSession = await flaggedSession.refresh();
    return bookshelfToDomainConverter.buildDomainObject(BookshelfSession, flaggedSession);
  },

  async updatePublishedAt({ id, publishedAt }) {
    let publishedSession = await new BookshelfSession({ id }).save({ publishedAt }, { patch: true });
    publishedSession = await publishedSession.refresh();
    return bookshelfToDomainConverter.buildDomainObject(BookshelfSession, publishedSession);
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
