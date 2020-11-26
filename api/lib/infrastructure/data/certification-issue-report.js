const Bookshelf = require('../bookshelf');

const modelName = 'CertificationIssueReport';

module.exports = Bookshelf.model(modelName, {

  tableName: 'certification-issue-reports',
  hasTimestamps: ['createdAt', 'updatedAt'],
  requireFetch: false,

  parse(rawAttributes) {
    if (rawAttributes.completedAt) {
      rawAttributes.completedAt = new Date(rawAttributes.completedAt);
    }

    return rawAttributes;
  },

}, {
  modelName,
});
