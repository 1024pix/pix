const Bookshelf = require('../bookshelf');

module.exports = Bookshelf.model('PartnerCertification', {
  tableName: 'partner-certifications',

  get idAttribute() { return null; }
});
