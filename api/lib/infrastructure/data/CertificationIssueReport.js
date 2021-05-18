const Bookshelf = require('../bookshelf');

const modelName = 'CertificationIssueReport';

module.exports = Bookshelf.model(modelName, {
  tableName: 'certification-issue-reports',
  hasTimestamps: ['createdAt', 'updatedAt'],
}, {
  modelName,
});
