import './ComplementaryCertification.js';

import { Bookshelf } from '../bookshelf.js';

const modelName = 'CertificationCenter';

const BookshelfCertificationCenter = Bookshelf.model(
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
        'complementaryCertificationId',
      );
    },
  },
  {
    modelName,
  },
);

export { BookshelfCertificationCenter };
