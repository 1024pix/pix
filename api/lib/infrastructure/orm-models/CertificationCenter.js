const Bookshelf = require('../bookshelf');

require('./Accreditation');

const modelName = 'CertificationCenter';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'certification-centers',
    hasTimestamps: ['createdAt', null],

    certificationCenterMemberships() {
      return this.hasMany('CertificationCenterMembership', 'certificationCenterId');
    },

    accreditations() {
      return this.belongsToMany(
        'Accreditation',
        'complementary-certification-habilitations',
        'certificationCenterId',
        'complementaryCertificationId'
      );
    },
  },
  {
    modelName,
  }
);
