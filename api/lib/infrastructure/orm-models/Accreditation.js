const Bookshelf = require('../bookshelf');

const modelName = 'Accreditation';

module.exports = Bookshelf.model(modelName, {

  tableName: 'accreditations',
  hasTimestamps: ['createdAt', null],
}, {
  modelName,
});
