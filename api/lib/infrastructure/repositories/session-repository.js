const _ = require('lodash');

const BookshelfSession = require('../data/session');
const Session = require('../../domain/models/Session');
const { NotFoundError } = require('../../domain/errors');

function _toDomain(bookshelfSession) {
  if (bookshelfSession) {
    const sessionReturned = bookshelfSession.toJSON();
    sessionReturned.certifications = bookshelfSession.related('certificationCourses').toJSON();
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
      .fetch({ require: true, withRelated: ['certificationCourses'] })
      .then(_toDomain)
      .catch(() => {
        return Promise.reject(new NotFoundError());
      });
  }
};
