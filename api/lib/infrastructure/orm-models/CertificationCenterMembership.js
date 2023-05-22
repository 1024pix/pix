import { Bookshelf } from '../bookshelf.js';

import './CertificationCenter.js';
import './User.js';

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
  }
);

export { BookshelfCertificationCenterMembership };
