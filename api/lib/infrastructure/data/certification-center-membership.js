const Bookshelf = require('../bookshelf');

require('./certification-center');

const modelName = 'CertificationCenterMembership';

module.exports = Bookshelf.model(modelName, {

  tableName: 'certification-center-memberships',
  hasTimestamps: ['createdAt', null],
  requireFetch: false,

  user() {
    return this.belongsTo('User', 'userId');
  },

  certificationCenter() {
    return this.belongsTo('CertificationCenter', 'certificationCenterId');
  },

}, {
  modelName
});
