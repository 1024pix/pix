const Bookshelf = require('../bookshelf');

const modelName = 'ComplementaryCertificationCourse';

module.exports = Bookshelf.model(
  modelName,
  {
    tableName: 'complementary-certification-courses',
    hasTimestamps: ['createdAt'],
  },
  {
    modelName,
  }
);
