import { Bookshelf } from '../bookshelf.js';
import './CertificationCandidate.js';

const modelName = 'Session';

const BookshelfSession = Bookshelf.model(
  modelName,
  {
    tableName: 'sessions',
    hasTimestamps: ['createdAt', null],

    certificationCandidates() {
      return this.hasMany('CertificationCandidate', 'sessionId');
    },
  },
  {
    modelName,
  }
);

export { BookshelfSession };
