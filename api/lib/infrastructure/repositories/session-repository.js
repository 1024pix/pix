const _ = require('lodash');

const BookshelfCertificationCourse = require('../data/certification-course');
const BookshelfSession = require('../data/session');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const Bookshelf = require('../bookshelf');
const { NotFoundError, UserNotAuthorizedToAccessEntity } = require('../../domain/errors');
const { statuses } = require('../../domain/models/Session');

function _toDomain(bookshelfSession) {
  if (bookshelfSession) {
    const session = bookshelfToDomainConverter.buildDomainObject(BookshelfSession, bookshelfSession);
    session.certifications = bookshelfSession.related('certificationCourses').map((certificationCourse) => {
      return bookshelfToDomainConverter.buildDomainObject(BookshelfCertificationCourse, certificationCourse);
    });
    return session;
  }
  return null;
}

module.exports = {
  save: async (sessionData) => {
    sessionData = _.omit(sessionData, ['certifications', 'certificationCandidates']);

    const newSession = await new BookshelfSession(sessionData).save();
    return _toDomain(newSession);
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

  getByAccessCode: async (accessCode) => {
    try {
      const sessionWithAccessCode = await BookshelfSession
        .where({ accessCode })
        .fetch({ require: true });
      return _toDomain(sessionWithAccessCode);
    } catch (err) {
      if (err instanceof BookshelfSession.NotFoundError) {
        throw new NotFoundError();
      }
      throw err;
    }
  },

  async get(idSession) {
    try {
      const session = await BookshelfSession
        .where({ id: idSession })
        .fetch({ require: true, withRelated: ['certificationCourses'] });
      return _toDomain(session);
    } catch (err) {
      if (err instanceof BookshelfSession.NotFoundError) {
        throw new NotFoundError();
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
      return _toDomain(session);
    } catch (err) {
      if (err instanceof BookshelfSession.NotFoundError) {
        throw new NotFoundError();
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
      'examinerComment',
    ]);

    let updatedSession = await new BookshelfSession({ id: session.id })
      .save(sessionDataToUpdate, { patch: true, method: 'update' });
    updatedSession = await updatedSession.refresh();
    return _toDomain(updatedSession);
  },

  async find() {
    const foundSessions = await BookshelfSession
      .query((qb) => {
        qb.orderBy('createdAt', 'desc')
          .limit(10); // remove after pagination
      })
      .fetchAll({});

    return foundSessions.map(_toDomain);
  },

  async findByCertificationCenterId(certificationCenterId) {
    const foundSessions = await BookshelfSession
      .where({ certificationCenterId })
      .query((qb) => {
        qb.orderBy('date', 'desc');
        qb.orderBy('time', 'desc');
      })
      .fetchAll({});

    return foundSessions.map(_toDomain);
  },

  async ensureUserHasAccessToSession(userId, sessionId) {
    try {
      await BookshelfSession
        .where({ 'sessions.id': sessionId, 'certification-center-memberships.userId': userId })
        .query((qb) => {
          qb.innerJoin('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId');
          qb.innerJoin('certification-center-memberships', 'certification-center-memberships.certificationCenterId', 'certification-centers.id');
        })
        .fetch({ require: true });
    } catch (_err) {
      throw new UserNotAuthorizedToAccessEntity(sessionId);
    }
  },

  async updateStatusAndExaminerComment(session) {
    const sessionDataToUpdate = _.pick(session, [
      'status',
      'examinerComment',
    ]);

    let updatedSession = await new BookshelfSession({ id: session.id })
      .save(sessionDataToUpdate, { patch: true });
    updatedSession = await updatedSession.refresh();
    return _toDomain(updatedSession);
  },
};
