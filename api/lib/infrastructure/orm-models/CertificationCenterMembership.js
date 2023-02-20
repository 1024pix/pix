import Bookshelf from '../bookshelf';

import './CertificationCenter';
import './User';

const modelName = 'CertificationCenterMembership';

export default Bookshelf.model(
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
