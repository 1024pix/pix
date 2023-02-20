import Bookshelf from '../bookshelf';

const modelName = 'CertificationIssueReport';

export default Bookshelf.model(
  modelName,
  {
    tableName: 'certification-issue-reports',
    hasTimestamps: ['createdAt', 'updatedAt'],
  },
  {
    modelName,
  }
);
