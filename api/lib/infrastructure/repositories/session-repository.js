const _ = require('lodash');

const BookshelfSession = require('../data/session');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const Bookshelf = require('../bookshelf');
const { NotFoundError } = require('../../domain/errors');

module.exports = {

  async save(sessionData) {
    sessionData = _.omit(sessionData, ['certificationCandidates']);

    const newSession = await new BookshelfSession(sessionData).save();
    return bookshelfToDomainConverter.buildDomainObject(BookshelfSession, newSession);
  },

  async isSessionCodeAvailable(accessCode) {
    const sessionWithAccessCode = await BookshelfSession
      .where({ accessCode })
      .fetch({});

    return !sessionWithAccessCode;
  },

  async isFinalized(id) {
    const session = await BookshelfSession
      .query((qb) => {
        qb.where({ id });
        qb.whereRaw('?? IS NOT NULL', ['finalizedAt']);
      })
      .fetch({ columns: 'id' });
    return Boolean(session);
  },

  async get(idSession) {
    try {
      const session = await BookshelfSession
        .where({ id: idSession })
        .fetch({ require: true });
      return bookshelfToDomainConverter.buildDomainObject(BookshelfSession, session);
    } catch (err) {
      if (err instanceof BookshelfSession.NotFoundError) {
        throw new NotFoundError('La session n\'existe pas ou son accès est restreint');
      }
      throw err;
    }
  },

  async getWithCertificationCandidates(idSession) {
    try {
      const session = await BookshelfSession
        .where({ id: idSession })
        .fetch({ require: true, withRelated: [
          {
            'certificationCandidates': function(qb) {
              qb.select(Bookshelf.knex.raw('*'));
              qb.orderByRaw('LOWER("certification-candidates"."lastName") asc');
              qb.orderByRaw('LOWER("certification-candidates"."firstName") asc');
            }
          }
        ]
        });
      return bookshelfToDomainConverter.buildDomainObject(BookshelfSession, session);
    } catch (err) {
      if (err instanceof BookshelfSession.NotFoundError) {
        throw new NotFoundError('La session n\'existe pas ou son accès est restreint');
      }
      throw err;
    }
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

    let updatedSession = await new BookshelfSession({ id: session.id })
      .save(sessionDataToUpdate, { patch: true, method: 'update' });
    updatedSession = await updatedSession.refresh();
    return bookshelfToDomainConverter.buildDomainObject(BookshelfSession, updatedSession);
  },

  async findByCertificationCenterId(certificationCenterId) {
    const foundSessions = await BookshelfSession
      .where({ certificationCenterId })
      .query((qb) => {
        qb.orderBy('date', 'desc');
        qb.orderBy('time', 'desc');
      })
      .fetchAll({});

    return bookshelfToDomainConverter.buildDomainObjects(BookshelfSession, foundSessions);
  },

  async doesUserHaveCertificationCenterMembershipForSession(userId, sessionId) {
    const session = await BookshelfSession
      .where({ 'sessions.id': sessionId, 'certification-center-memberships.userId': userId })
      .query((qb) => {
        qb.innerJoin('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId');
        qb.innerJoin('certification-center-memberships', 'certification-center-memberships.certificationCenterId', 'certification-centers.id');
      })
      .fetch({ columns: 'sessions.id' });
    return Boolean(session);
  },

  async finalize({ id, examinerGlobalComment, finalizedAt }) {
    let updatedSession = await new BookshelfSession({ id })
      .save({ examinerGlobalComment, finalizedAt }, { patch: true });
    updatedSession = await updatedSession.refresh();
    return bookshelfToDomainConverter.buildDomainObject(BookshelfSession, updatedSession);
  },

  async flagResultsAsSentToPrescriber({ id, resultsSentToPrescriberAt }) {
    let flaggedSession = await new BookshelfSession({ id })
      .save({ resultsSentToPrescriberAt }, { patch: true });
    flaggedSession = await flaggedSession.refresh();
    return bookshelfToDomainConverter.buildDomainObject(BookshelfSession, flaggedSession);
  },

  async updatePublishedAt({ id, publishedAt }) {
    let publishedSession = await new BookshelfSession({ id })
      .save({ publishedAt }, { patch: true });
    publishedSession = await publishedSession.refresh();
    return bookshelfToDomainConverter.buildDomainObject(BookshelfSession, publishedSession);
  },

  async findPaginatedFiltered({ filters, page }) {
    const { models, pagination } = await BookshelfSession
      .query((qb) => {
        const { id } = filters;
        if (id) {
          qb.where({ id });
        }
        qb.orderByRaw('?? ASC NULLS FIRST', 'publishedAt');
        qb.orderByRaw('?? ASC', 'finalizedAt');
      })
      .fetchPage({ page: page.number, pageSize: page.size });

    return {
      sessions: bookshelfToDomainConverter.buildDomainObjects(BookshelfSession, models),
      pagination,
    };
  },

};
