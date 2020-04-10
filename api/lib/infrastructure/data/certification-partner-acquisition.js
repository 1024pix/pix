const Bookshelf = require('../bookshelf');

module.exports = Bookshelf.model('CertificationPartnerAcquisition', {
  tableName: 'certification-partner-acquisitions',

  get idAttribute() { return null; }
});
