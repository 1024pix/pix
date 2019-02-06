const Bookshelf = require('../bookshelf');

const bookshelfName = 'CertificationChallenge';

module.exports = Bookshelf.model('CertificationChallenge', {
  tableName: 'certification-challenges',
  bookshelfName,
});
