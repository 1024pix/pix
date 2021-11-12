const Bookshelf = require('../bookshelf');

require('./ComplementaryCertification');

const modelName = 'CertificationCenter';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'certification-centers',
    hasTimestamps: ['createdAt', 'updatedAt'],

    certificationCenterMemberships() {
      return this.hasMany('CertificationCenterMembership', 'certificationCenterId');
    },

    habilitations() {
      return this.belongsToMany(
        'ComplementaryCertification',
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
