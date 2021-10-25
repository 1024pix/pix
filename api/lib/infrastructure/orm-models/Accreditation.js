const Bookshelf = require('../bookshelf');

const modelName = 'Accreditation';

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
