const Bookshelf = require('../bookshelf.js');

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
