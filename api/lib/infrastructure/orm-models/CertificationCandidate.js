import Bookshelf from '../bookshelf';

import './Session';
import './User';

const modelName = 'CertificationCandidate';

export default Bookshelf.model(
  modelName,
  {
    tableName: 'certification-candidates',
    hasTimestamps: ['createdAt'],

    session() {
      return this.belongsTo('Session', 'sessionId');
    },

    user() {
      return this.belongsTo('User', 'userId');
    },
  },
  {
    modelName,
  }
);
