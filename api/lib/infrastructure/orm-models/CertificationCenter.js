import Bookshelf from '../bookshelf';

import './ComplementaryCertification';

const modelName = 'CertificationCenter';

export default Bookshelf.model(
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
