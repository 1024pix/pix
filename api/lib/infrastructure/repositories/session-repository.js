const BookshelfSession = require('../data/session');
const Session = require('../../domain/models/Session');

function _toDomain(bookshelfSession) {
  const sessionReturned = bookshelfSession.toJSON();
  return new Session(sessionReturned);
}

module.exports = {
  save: (sessionToBeSaved) => {
    return new BookshelfSession(sessionToBeSaved)
      .save()
      .then(_toDomain);
  }
};
