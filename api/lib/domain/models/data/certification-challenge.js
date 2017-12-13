const Bookshelf = require('../../../infrastructure/bookshelf');
Bookshelf.plugin('registry');

module.exports = Bookshelf.model('CertificationChallenge', {
  tableName: 'certification-challenges',
});
