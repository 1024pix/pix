const Bookshelf = require('../bookshelf');

const modelName = 'PartnerCertification';

module.exports = Bookshelf.model('PartnerCertification', {

  tableName: 'partner-certifications',
  requireFetch: false,

  get idAttribute() {
    return null;
  }

}, {
  modelName
});
