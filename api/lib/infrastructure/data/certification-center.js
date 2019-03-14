const Bookshelf = require('../bookshelf');

module.exports = Bookshelf.model('CertificationCenter', {

  tableName: 'certification-centers',
  hasTimestamps: ['createdAt', null],

  certificationCenterMemberships() {
    return this.hasMany('CertificationCenterMembership', 'certificationCenterId');
  },

});
