import Bookshelf from '../bookshelf';
import './CertificationCandidate';

const modelName = 'Session';

export default Bookshelf.model(
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
