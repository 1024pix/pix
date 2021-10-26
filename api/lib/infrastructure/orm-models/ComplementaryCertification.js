const Bookshelf = require('../bookshelf');

const modelName = 'ComplementaryCertification';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'complementary-certifications',
    hasTimestamps: ['createdAt', null],
  },
  {
    modelName,
  }
);
