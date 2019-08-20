const _ = require('lodash');

const BookshelfCertificationCourse = require('../data/certification-course');
const BookshelfSession = require('../data/session');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const Bookshelf = require('../bookshelf');
const { NotFoundError } = require('../../domain/errors');

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
  save: (sessionToBeSaved) => {
    sessionToBeSaved = _.omit(sessionToBeSaved, ['certifications', 'certificationCandidates']);

    return new BookshelfSession(sessionToBeSaved)
      .save()
      .then(_toDomain);
  },

  isSessionCodeAvailable: (accessCode) => {
    return BookshelfSession
      .where({ accessCode })
      .fetch({})
      .then((result) => !result);
  },

  getByAccessCode: (accessCode) => {
    return BookshelfSession
      .where({ accessCode })
      .fetch({})
      .then(_toDomain);
  },

  get(idSession) {
    return BookshelfSession
      .where({ id: idSession })
      .fetch({ require: true, withRelated: ['certificationCourses'] })
      .then(_toDomain)
      .catch((error) => {
        if (error instanceof BookshelfSession.NotFoundError) {
          throw new NotFoundError();
        }
        throw error;
      });
  },

  getWithCertificationCandidates(idSession) {
    return BookshelfSession
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
      })
      .then(_toDomain)
      .catch((error) => {
        if (error instanceof BookshelfSession.NotFoundError) {
          throw new NotFoundError();
        }
        throw error;
      });
  },

  update(session) {
    const sessionDataToUpdate = _.pick(
      session,
      [
        'address',
        'room',
        'accessCode',
        'examiner',
        'date',
        'time',
        'description'
      ]
    );

    return new BookshelfSession({ id: session.id })
      .save(sessionDataToUpdate, { patch: true })
      .then((model) => model.refresh())
      .then(_toDomain);
  },

  find() {
    return BookshelfSession
      .query((qb) => {
        qb.orderBy('createdAt', 'desc')
          .limit(10); // remove after pagination
      })
      .fetchAll({})
      .then((sessions) => sessions.map(_toDomain));
  },

  findByCertificationCenterId(certificationCenterId) {
    return BookshelfSession
      .where({ certificationCenterId })
      .query((qb) => {
        qb.orderBy('date', 'desc');
        qb.orderBy('time', 'desc');
      })
      .fetchAll({})
      .then((sessions) => sessions.map(_toDomain));
  },

  ensureUserHasAccessToSession(userId, sessionId) {
    return BookshelfSession
      .where({ 'sessions.id': sessionId, 'certification-center-memberships.userId': userId })
      .query((qb) => {
        qb.innerJoin('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId');
        qb.innerJoin('certification-center-memberships', 'certification-center-memberships.certificationCenterId', 'certification-centers.id');
      })
      .fetch({
        require: true
      });
  }
};
