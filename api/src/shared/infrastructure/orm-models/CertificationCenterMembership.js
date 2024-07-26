import './CertificationCenter.js';
import './User.js';

import { Bookshelf } from '../../../../lib/infrastructure/bookshelf.js';

const modelName = 'CertificationCenterMembership';

const BookshelfCertificationCenterMembership = Bookshelf.model(
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
  },
);

export { BookshelfCertificationCenterMembership };
