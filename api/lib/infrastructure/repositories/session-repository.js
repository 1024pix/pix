const _ = require('lodash');

const BookshelfSession = require('../data/session');
const Session = require('../../domain/models/Session');
const CertificationCourse = require('../../domain/models/CertificationCourse');
const { NotFoundError } = require('../../domain/errors');

function _toDomain(bookshelfSession) {
  if (bookshelfSession) {
    const sessionReturned = bookshelfSession.toJSON();
    sessionReturned.certifications = bookshelfSession.related('certificationCourses').map((certificationCourse) => {
      return CertificationCourse.fromAttributes(certificationCourse);
    });
    return new Session(sessionReturned);
  }
  return null;
}

module.exports = {
  save: (sessionToBeSaved) => {
    sessionToBeSaved = _.omit(sessionToBeSaved, ['certifications']);

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
      .fetch({ require: true })
      .then(_toDomain)
      .catch((error) => {
        if (error instanceof BookshelfSession.NotFoundError) {
          throw new NotFoundError();
        }
        throw error;
      });
  },

  getWithCertificationCourses(idSession) {
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
