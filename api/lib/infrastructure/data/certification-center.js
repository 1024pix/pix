const Bookshelf = require('../bookshelf');

module.exports = Bookshelf.model('CertificationCenter', {

  tableName: 'certification-centers',

  certificationCenterMemberships() {
    return this.hasMany('CertificationCenterMembership', 'certificationCenterId');
  },

});
