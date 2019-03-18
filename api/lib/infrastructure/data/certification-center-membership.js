const Bookshelf = require('../bookshelf');

module.exports = Bookshelf.model('CertificationCenterMembership', {

  tableName: 'certification-center-memberships',
  hasTimestamps: ['createdAt', null],

  user() {
    return this.belongsTo('User', 'userId');
  },

  certificationCenter() {
    return this.belongsTo('CertificationCenter', 'certificationCenterId');
  },

});
