const Bookshelf = require('../bookshelf');

const bookshelfName = 'CertificationCenter';

module.exports = Bookshelf.model(bookshelfName, {

  tableName: 'certification-centers',
  bookshelfName,

  certificationCenterMemberships() {
    return this.hasMany('CertificationCenterMembership', 'certificationCenterId');
  },

});
