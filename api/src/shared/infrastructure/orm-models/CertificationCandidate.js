import './Session.js';
import './User.js';

import { Bookshelf } from '../../../../lib/infrastructure/bookshelf.js';

const modelName = 'CertificationCandidate';

const BookshelfCertificationCandidate = Bookshelf.model(
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
  },
);

export { BookshelfCertificationCandidate };
