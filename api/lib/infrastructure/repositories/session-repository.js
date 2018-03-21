const BookshelfSession = require('../data/session');
const Session = require('../../domain/models/Session');

function _toDomain(bookshelfSession) {
  if(bookshelfSession) {
    const sessionReturned = bookshelfSession.toJSON();
    return new Session(sessionReturned);
  }
  return null;
}

module.exports = {
  save: (sessionToBeSaved) => {
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
  }
};
