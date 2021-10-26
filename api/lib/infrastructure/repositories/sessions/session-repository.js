const _ = require('lodash');

const { knex } = require('../../../../db/knex-database-connection');
const BookshelfSession = require('../../orm-models/Session');
const bookshelfToDomainConverter = require('../../utils/bookshelf-to-domain-converter');
const { NotFoundError } = require('../../../domain/errors');
const Session = require('../../../domain/models/Session');
const CertificationCandidate = require('../../../domain/models/CertificationCandidate');

module.exports = {
  async save(sessionData) {
    sessionData = _.omit(sessionData, ['certificationCandidates']);

    const newSession = await new BookshelfSession(sessionData).save();
    return bookshelfToDomainConverter.buildDomainObject(BookshelfSession, newSession);
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

  async get(idSession) {
    try {
      const session = await BookshelfSession.where({ id: idSession }).fetch();
      return bookshelfToDomainConverter.buildDomainObject(BookshelfSession, session);
    } catch (err) {
      if (err instanceof BookshelfSession.NotFoundError) {
        throw new NotFoundError("La session n'existe pas ou son accès est restreint");
      }
      throw err;
    }
  },

  async getWithCertificationCandidates(idSession) {
    const results = await knex
      .select('sessions.*')
      .select({
        certificationCandidates: knex.raw(`
        json_agg("certification-candidates".* order by lower("lastName"), lower("firstName"))
        `),
      })
      .from('sessions')
      .leftJoin('certification-candidates', 'certification-candidates.sessionId', 'sessions.id')
      .groupBy('sessions.id')
      .where({ 'sessions.id': idSession })
      .first();
    if (!results) {
      throw new NotFoundError("La session n'existe pas ou son accès est restreint");
    }
    return _toDomain(results);
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

  async finalize({ id, examinerGlobalComment, finalizedAt }) {
    let updatedSession = await new BookshelfSession({ id }).save(
      { examinerGlobalComment, finalizedAt },
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
};

function _toDomain(results) {
  const toDomainCertificationCandidates = results.certificationCandidates.map((candidate) => {
    return new CertificationCandidate({ ...candidate });
  });

  return new Session({
    ...results,
    certificationCandidates: toDomainCertificationCandidates,
  });
}
