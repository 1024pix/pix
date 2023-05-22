import { Bookshelf } from '../bookshelf.js';

const modelName = 'CertificationIssueReport';

const BookshelfCertificationIssueReport = Bookshelf.model(
  modelName,
  {
    tableName: 'certification-issue-reports',
    hasTimestamps: ['createdAt', 'updatedAt'],
  },
  {
    modelName,
  }
);

export { BookshelfCertificationIssueReport };
