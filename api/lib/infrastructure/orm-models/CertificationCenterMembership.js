const Bookshelf = require('../bookshelf.js');

require('./CertificationCenter.js');
require('./User.js');

const modelName = 'CertificationCenterMembership';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'certification-center-memberships',
    hasTimestamps: ['createdAt', null],

    user() {
      return this.belongsTo('User', 'userId');
    },

    certificationCenter() {
      return this.belongsTo('CertificationCenter', 'certificationCenterId');
    },
  },
  {
    modelName,
  }
);
