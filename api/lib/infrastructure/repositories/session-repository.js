const _ = require('lodash');

const BookshelfSession = require('../data/session');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const Bookshelf = require('../bookshelf');
const { NotFoundError } = require('../../domain/errors');
const { statuses } = require('../../domain/models/Session');

module.exports = {

  save: async (sessionData) => {
    sessionData = _.omit(sessionData, ['certificationCandidates']);

    const newSession = await new BookshelfSession(sessionData).save();
    return bookshelfToDomainConverter.buildDomainObject(BookshelfSession, newSession);
  },

  isSessionCodeAvailable: async (accessCode) => {
    const sessionWithAccessCode = await BookshelfSession
      .where({ accessCode })
      .fetch({});

    return !sessionWithAccessCode;
  },

  isFinalized: async (id) => {
    const session = await BookshelfSession
      .where({ id, status: statuses.FINALIZED })
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

  async update(session) {
    const sessionDataToUpdate = _.pick(session, [
      'address',
      'room',
      'accessCode',
      'examiner',
      'date',
      'time',
      'description',
      'status',
      'examinerGlobalComment',
      'resultsSentToPrescriberAt',
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

  async finalize({ id, status, examinerGlobalComment, finalizedAt }) {
    let updatedSession = await new BookshelfSession({ id })
      .save({ id, status, examinerGlobalComment, finalizedAt }, { patch: true });
    updatedSession = await updatedSession.refresh();
    return bookshelfToDomainConverter.buildDomainObject(BookshelfSession, updatedSession);
  },

  async flagResultsAsSentToPrescriber({ id, resultsSentToPrescriberAt }) {
    let flaggedSession = await new BookshelfSession({ id })
      .save({ resultsSentToPrescriberAt }, { patch: true });
    flaggedSession = await flaggedSession.refresh();
    return bookshelfToDomainConverter.buildDomainObject(BookshelfSession, flaggedSession);
  },

  async findPaginatedFiltered({ filters, page }) {
    const { models, pagination } = await BookshelfSession
      .query((qb) => {
        const { id } = filters;
        if (id) {
          qb.whereRaw('CAST(id as TEXT) LIKE ?', `%${id.toString()}%`);
        }
      })
      .fetchPage({ page: page.number, pageSize: page.size });

    return {
      sessions: bookshelfToDomainConverter.buildDomainObjects(BookshelfSession, models),
      pagination,
    };
  },

};
